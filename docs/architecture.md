# 架构设计文档

## 项目整体架构

```
radial-stack/
├── src/
│   ├── core/              <-- 共享核心（浏览器 + Node.js 通用）
│   │   ├── svg-builder.js     主入口，组装完整 SVG
│   │   ├── gradient.js        渐变算法（径向渐变定义 + 变换链）
│   │   ├── palettes.js        8 套配色方案
│   │   ├── text-layout.js     4 种文字排版方案
│   │   ├── color-utils.js     OKLCH 颜色空间工具
│   │   └── utils.js           种子随机数、XML 转义等
│   └── cli/               <-- CLI 专用（依赖 Node.js API）
│       ├── index.js           命令行参数解析 + 流程控制
│       ├── png-export.js      SVG 转 PNG（含字体检测）
│       ├── file-reader.js     输入文件解析
│       └── overview.js        总览 HTML 生成
├── web/                   <-- Web 预览界面
├── config/
│   └── default.json           默认配置（SSOT）
├── tests/                 <-- vitest 测试
└── generate.js            <-- CLI 入口脚本
```

### 调用关系

```
                    ┌──────────────┐
                    │  generate.js │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  cli/index   │
                    │  (Commander) │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │    core/svg-builder     │ <── Web 预览也直接调用此模块
              │      buildSVG()         │
              └────┬─────┬─────┬────────┘
                   │     │     │
          ┌────────┘     │     └────────┐
          ▼              ▼              ▼
   core/gradient   core/text-layout  core/palettes
          │              │
          ▼              ▼
   core/color-utils   core/utils
```

## 共享核心模块设计理念

`src/core/` 目录下的所有模块均为**纯函数**，不依赖任何 Node.js 特有 API（如 `fs`、`path`）。这一设计使得核心逻辑可以同时运行在：

- **Node.js CLI** — 通过 `src/cli/` 提供命令行界面，支持批量生成和 PNG 导出
- **浏览器 Web** — 通过 `web/` 目录中的页面直接 import 核心模块，实现实时预览

CLI 专用功能（文件 I/O、PNG 渲染、命令行参数解析）被隔离在 `src/cli/` 中，依赖 Node.js 原生模块和第三方库（`commander`、`@resvg/resvg-js`）。

## 渐变算法详解

本项目的渐变实现参照了 OpenAI 的 SVG 渐变风格（由 Justin Jay Wang 设计），核心思路是**多层径向渐变叠加**产生丰富的色彩变化。

### 算法流程

1. **选色**：从配色方案中随机挑选 4 种主色（`selectPrimaryColors`）
2. **定义渐变**：为每种主色创建一个 `<radialGradient>`，部分渐变使用 3 个色标（通过 OKLCH 中间色增强过渡）
3. **叠加层**：生成 12 层（默认） `<rect>` 元素，每层引用一个渐变定义并应用独立变换
4. **后处理**：通过 CSS `filter:saturate()` 增强色彩饱和度

### 12 层渐变叠加

每个渐变定义被多层 `<rect>` 循环引用（`i % gradientIds.length`），每层具有独立的变换参数和不透明度。外层偏透明（0.4-0.7），内层偏实（0.7-1.0），产生自然的深度感。

### 变换链

每层 `<rect>` 的 `transform` 属性由以下变换按序组合：

```
translate(center, center)           // 移动到画布中心
  scale(sx, sy)                     // 随机缩放 (0.7-1.5, 0.6-1.5)
    skewX(deg)                      // 随机倾斜 (-10 ~ 10 度)
      rotate(deg)                   // 随机旋转 (0-360 度)
        translate(ox, oy)           // 随机偏移
          translate(-center, -center)  // 移回原点
```

这一变换链使每层渐变在画布上呈现不同的位置、角度和比例，叠加后产生复杂的色彩交融效果。

### 色彩增强

- **饱和度滤镜**：SVG 根元素应用 `filter:saturate(125%-140%)`（默认 130%），让颜色更鲜艳
- **可选高斯模糊**：`<feGaussianBlur>` 平滑渐变边缘
- **可选噪声纹理**：`<feTurbulence>` + `<feBlend mode="soft-light">` 增加有机质感

## OKLCH 颜色科学

项目在渐变色标插值时使用 **OKLCH 颜色空间**（通过 `culori` 库），而非传统的 RGB 或 HSL。

### 为什么选择 OKLCH

| 问题 | RGB/HSL | OKLCH |
|------|---------|-------|
| 中间色调 | 红+绿 -> 灰褐色（muddy midtones） | 红+绿 -> 清晰的黄橙色 |
| 感知均匀性 | 数值变化与视觉感受不一致 | 数值等距变化 = 视觉等距变化 |
| 亮度控制 | HSL 的 L 不反映真实亮度 | OKLCH 的 L 是感知亮度 |

OKLCH 三通道含义：
- **L** (Lightness)：感知亮度 [0, 1]
- **C** (Chroma)：色彩饱和程度
- **H** (Hue)：色相角度 [0, 360)

具体实现见 `src/core/color-utils.js`，提供了 `hexToOklch`、`oklchToHex`、`interpolateColors` 和 `midpointColor` 四个函数。

## 文字排版方案对比

项目支持 4 种文字排版方案，均定义在 `src/core/text-layout.js`：

| 方案 | 标识符 | 说明 | 适用场景 |
|------|--------|------|----------|
| 胶囊标签 | `pill` | 半透明圆角矩形背景 + 居中文字 | 默认方案，正式场合 |
| 叠加文字 | `overlay` | 大号白色文字 + 阴影投射 | 视觉冲击力强 |
| 竖排文字 | `vertical` | 逐字竖排 + 阴影 | 传统中文风格 |
| 艺术散落 | `artistic` | 网格约束下的随机散布 | 创意设计 |

### pill（胶囊标签）
- 半透明白色背景（`rgba(255,255,255,0.88)`）
- 圆角矩形自动适应文字长度
- 深色文字（`#333333`），可自定义颜色、圆角、内边距

### overlay（叠加文字）
- 字号放大 1.3 倍
- 白色文字 + `<feDropShadow>` 投影滤镜
- 可自定义文字颜色、阴影颜色和模糊程度

### vertical（竖排文字）
- 每个字符独立 `<text>` 元素，行高 1.4 倍
- 垂直居中对齐
- 白色文字 + 投影

### artistic（艺术散落）
- 网格布局约束防止字符重叠
- 每个字符随机偏移（单元格内 +/-15%）
- 字号随机变化（基准 +/-25%）
- 需要 RNG 参数实现可复现的随机效果

## 模块依赖关系图

```
seedrandom (npm)        culori (npm)        commander (npm)    @resvg/resvg-js (npm)
     │                      │                     │                    │
     ▼                      ▼                     │                    │
  utils.js ◄──────── color-utils.js               │                    │
     │                      │                     │                    │
     │    ┌─────────────────┘                     │                    │
     ▼    ▼                                       │                    │
  gradient.js                                     │                    │
     │                                            │                    │
     │    palettes.js    text-layout.js ◄── utils.js                  │
     │         │              │                   │                    │
     ▼         ▼              ▼                   │                    │
  ┌─────────────────────────────────┐             │                    │
  │        svg-builder.js           │             │                    │
  │          buildSVG()             │             │                    │
  └──────────────┬──────────────────┘             │                    │
                 │                                │                    │
       ┌─────────┴──────────┐                     │                    │
       ▼                    ▼                     ▼                    ▼
   web/index.html      cli/index.js ─────► cli/png-export.js
                            │
                            ▼
                       generate.js
```

> 源码参考：所有核心模块位于 `src/core/`，CLI 模块位于 `src/cli/`，默认配置位于 `config/default.json`。
