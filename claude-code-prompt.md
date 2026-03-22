# 项目：部门名称渐变图像批量生成器

## 一、项目概述

请帮我构建一个 **命令行工具 + 可选 Web 预览界面**，用于批量生成带有中文部门名称的方形渐变背景图像。

最终产物是每个部门对应一张正方形图片（SVG 为主，可选导出 PNG），背景是类似 OpenAI 官网风格的有机渐变色，前景是部门中文名称，整体视觉风格现代、高级、可识别。

### 核心参考

OpenAI 前设计师 Justin Jay Wang 记录过他们的渐变技术演变（https://justinjay.wang/methods-for-random-gradients/）：

- **早期方案**：用 Processing + Perlin 噪声高度图（heightmap）生成有机渐变
- **2020-2022 官网方案**：多层 SVG `<radialGradient>` 叠加，随机调整焦点（focal point）、缩放（scale）、旋转（rotation）、偏移（skew/translation），每个 SVG 仅约 6KB，可无限缩放
- **最新方案**：用 AI 图像生成（DALL·E）+ 后期调色

我们这个项目采用 **SVG 多层径向渐变叠加** 方案作为核心，因为它体积小、矢量可缩放、可编程控制、适合批量生成。

---

## 二、功能需求

### 2.1 命令行批量生成（核心功能）

```bash
# 基本用法：从 JSON/CSV 文件读取部门列表，批量生成
node generate.js --input departments.json --output ./output/

# 单个生成
node generate.js --name "综合管理部" --output ./output/

# 指定配置
node generate.js --input departments.json --output ./output/ --config theme-warm.json
```

**输入格式**（departments.json 示例）：
```json
[
  { "name": "综合管理部", "color_hint": "warm" },
  { "name": "技术研发中心", "color_hint": "cool" },
  { "name": "市场营销部" },
  { "name": "人力资源部" },
  { "name": "财务管理部" },
  { "name": "法务合规部" },
  { "name": "战略发展部" },
  { "name": "产品设计部", "color_hint": "creative" },
  { "name": "数据智能部", "color_hint": "tech" },
  { "name": "客户服务中心" }
]
```

也支持纯文本列表（每行一个部门名）和 CSV。

### 2.2 输出要求

- **主输出**：SVG 文件（每个 < 10KB，矢量无限缩放）
- **可选输出**：PNG 文件（用 puppeteer 或 sharp/resvg 将 SVG 转为指定分辨率的 PNG，默认 1024×1024px）
- **文件命名**：`{部门名}.svg` / `{部门名}.png`，可配置命名模板
- **同时生成一个总览 HTML**（overview.html），把所有生成的图片排列展示，方便一次性预览

### 2.3 可选 Web 预览（加分项，非必须）

如果时间允许，做一个简单的本地 Web 页面（纯静态 HTML），支持：
- 输入部门名称，实时预览效果
- 切换配色方案
- 调节参数（渐变层数、模糊程度、文字大小等）
- 一键下载 SVG/PNG

---

## 三、视觉设计规范

### 3.1 整体尺寸

- 画布：**正方形**，SVG viewBox 建议 `0 0 800 800`
- PNG 导出默认分辨率：1024×1024

### 3.2 背景渐变

参照 OpenAI 的 SVG 渐变方案，核心技术实现：

```
1. 选择一个基底色（从当前配色方案中随机选取）
2. 叠加 5-8 层 <radialGradient>，每层：
   - 从配色方案中选取颜色
   - 随机化 cx/cy（圆心位置，范围 0.1-0.9）
   - 随机化 fx/fy（焦点偏移，在圆心附近 ±0.15）
   - 随机化 r（半径，0.3-0.8）
   - 应用 gradientTransform：随机旋转 + 随机缩放（椭圆化）
   - 中心色不透明度 0.6-1.0，边缘色透明度 0
3. 可选：叠加 SVG <filter> 中的 <feGaussianBlur> 做额外柔化
4. 可选：叠加 <feTurbulence> 做轻微噪声纹理
```

**关键要求**：
- 每次生成的渐变应该是 **唯一的**（使用随机种子），但同一个配色方案下的不同部门视觉上应该是 **和谐统一** 的
- 可以给每个部门设置一个 seed，这样同一个部门名称每次生成的结果可以是确定的（可复现）
- 渐变颜色之间的过渡要自然柔和，避免出现生硬的色带

### 3.3 配色方案（Palette）

预设至少 6 套配色方案，每套 5-7 个颜色：

| 方案名 | 关键词 | 色彩方向 |
|--------|--------|----------|
| `warm` | 温暖、活力 | 橙、粉、桃、珊瑚、金 |
| `cool` | 冷静、科技 | 蓝、青、靛、薄荷 |
| `sunset` | 落日、热情 | 红橙、紫红、金、深紫 |
| `forest` | 自然、生态 | 翠绿、橄榄、苔藓、米色 |
| `ocean` | 深邃、专业 | 深蓝、湖蓝、蓝绿、白 |
| `creative` | 创意、多彩 | 紫、品红、青、柠檬黄 |
| `tech` | 科技、未来 | 深灰、电光蓝、霓虹紫 |
| `elegant` | 优雅、商务 | 黑、金、深酒红、象牙白 |

用户也可以在配置文件中自定义配色方案（提供 hex 颜色数组即可）。

### 3.4 文字设计

这是最重要的部分之一，文字需要 **高可读性** 且有 **设计感**。

**排版方案**（至少实现以下一种，建议实现多种供选择）：

#### 方案 A：胶囊标签式（参照 OpenAI 的 GPT-5.4 标签）
- 文字放在一个圆角矩形（pill shape）中
- 背景半透明白色（rgba 255,255,255,0.85）或磨砂效果
- 文字颜色深灰/黑色
- 圆角矩形水平居中，垂直居中
- 适合 3-6 个字的部门名

#### 方案 B：直接大字叠加
- 文字直接放在渐变背景上
- 需要文字描边或阴影保证可读性
- 字号较大，占画面 50-70% 宽度
- 文字颜色白色 + 轻微投影（`<feDropShadow>`）
- 适合想要更大气、更沉浸感的场景

#### 方案 C：竖排文字
- 中文竖排（writing-mode: vertical-rl 或手动逐字排列）
- 居中或偏右放置
- 配合小号英文/拼音副标题（可选）
- 适合想要传统、文化感的场景

#### 方案 D：拆字艺术排列
- 把部门名称的每个字拆开
- 用不同大小、不同位置排列（但仍然可读）
- 比如"综合管理部"可以排成 2×2+1 的矩阵或错落排列
- 适合想要更有设计感、海报风格的场景

**字体要求**：
- 中文字体：优先使用系统自带的中文字体。SVG 中指定 font-family 顺序：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif`
- 如果要导出 PNG 且需要确保字体一致，可以考虑内嵌 Google Fonts 的 Noto Sans SC（通过 @font-face）
- 字重：标题用 Medium（500）或 Bold（700），副文本用 Regular（400）

**文字自适应**：
- 根据文字字数自动调整字号：
  - 2-3 字：最大号（如 72px）
  - 4-5 字：中号（如 56px）
  - 6-7 字：较小号（如 44px）
  - 8 字以上：自动缩小或换行
- pill 标签的宽度也要根据文字长度自适应

### 3.5 可选装饰元素

- **角标**：可以在右上角或左下角放一个小的编号/序号
- **边框**：可选给整个方形加一个极细的边框（0.5px，10% 透明度白色）
- **Logo 水印**：可选在固定位置放一个小 logo（用户提供 SVG path）

---

## 四、技术架构

### 4.1 技术栈

```
Node.js（主运行时）
├── SVG 生成：纯字符串模板拼接（无需额外库，SVG 本身就是 XML）
├── 随机数：使用 seedrandom 库实现可复现的随机（npm install seedrandom）
├── PNG 导出（可选）：puppeteer 或 @resvg/resvg-js
├── 命令行参数：commander 或 yargs
├── 文件 I/O：fs/path（Node 内置）
└── Web 预览（可选）：纯静态 HTML + 内联 JS，无需框架
```

### 4.2 项目结构

```
gradient-badge-generator/
├── generate.js              # 命令行入口
├── src/
│   ├── gradient.js          # 核心：SVG 渐变生成逻辑
│   ├── text-layout.js       # 文字排版（多种方案）
│   ├── palettes.js          # 预设配色方案
│   ├── svg-builder.js       # SVG 组装器
│   ├── png-export.js        # SVG → PNG 转换
│   └── utils.js             # 工具函数（seed random、颜色处理等）
├── config/
│   ├── default.json         # 默认配置
│   └── theme-warm.json      # 主题配置示例
├── templates/
│   └── overview.html        # 总览页面模板
├── examples/
│   ├── departments.json     # 示例部门列表
│   └── departments.csv      # CSV 格式示例
├── output/                  # 默认输出目录
├── web/                     # 可选 Web 预览
│   └── index.html           # 单文件预览页面
├── package.json
└── README.md
```

### 4.3 核心算法伪代码

```javascript
function generateGradientSVG(options) {
  const { 
    name,           // 部门名称
    size = 800,     // 画布尺寸
    palette,        // 配色方案（颜色数组）
    seed,           // 随机种子（默认用 name 的 hash）
    layers = 6,     // 渐变层数
    blur = 0,       // 额外模糊（0 = 不加）
    noise = false,  // 是否加噪声纹理
    textStyle = 'pill', // 文字排版方案：pill | overlay | vertical | artistic
    fontSize = 'auto',  // 字号：auto 或具体数值
  } = options;

  const rng = seedrandom(seed || name);

  // 1. 选基底色
  const bgColor = pickRandom(palette, rng);

  // 2. 生成 N 层径向渐变
  const gradientLayers = [];
  for (let i = 0; i < layers; i++) {
    gradientLayers.push({
      id: `grad_${i}`,
      cx: rng() * 0.8 + 0.1,
      cy: rng() * 0.8 + 0.1,
      fx: /* cx ± 0.15 */,
      fy: /* cy ± 0.15 */,
      r: rng() * 0.5 + 0.3,
      color1: pickRandom(palette, rng),
      color2: pickRandom(palette, rng),
      opacity: rng() * 0.4 + 0.6,
      rotation: rng() * 360,
      scaleX: rng() * 1.0 + 0.8,
      scaleY: rng() * 0.8 + 0.6,
    });
  }

  // 3. 可选滤镜
  const filters = [];
  if (blur > 0) filters.push(`<feGaussianBlur stdDeviation="${blur}" />`);
  if (noise) filters.push(`<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/><feBlend in="SourceGraphic" in2="noise" mode="soft-light" />`);

  // 4. 文字排版
  const textElements = layoutText(name, textStyle, size, fontSize);

  // 5. 组装 SVG
  return assembleSVG({ size, bgColor, gradientLayers, filters, textElements });
}
```

---

## 五、配置文件格式

```json
{
  "size": 800,
  "palette": "warm",
  "layers": 6,
  "blur": 0,
  "noise": false,
  "textStyle": "pill",
  "fontSize": "auto",
  "fontFamily": "PingFang SC, Microsoft YaHei, Noto Sans SC, sans-serif",
  "exportPNG": false,
  "pngSize": 1024,
  "outputDir": "./output",
  "filenameTemplate": "{name}",
  "overview": true,
  "pill": {
    "bgColor": "rgba(255,255,255,0.85)",
    "textColor": "#333333",
    "borderRadius": 28,
    "paddingX": 40,
    "paddingY": 16
  },
  "overlay": {
    "textColor": "#ffffff",
    "shadowColor": "rgba(0,0,0,0.3)",
    "shadowBlur": 8
  },
  "decorations": {
    "border": false,
    "borderColor": "rgba(255,255,255,0.1)",
    "borderWidth": 0.5,
    "cornerBadge": false,
    "logo": null
  }
}
```

---

## 六、质量要求

1. **代码质量**：模块化、清晰注释、易于扩展
2. **SVG 质量**：valid SVG，体积尽量小（< 10KB/个），在浏览器中渲染清晰
3. **中文支持**：确保中文字符在 SVG 中正确显示，text-anchor 和定位准确
4. **可复现性**：相同的 seed + 配置 = 相同的输出
5. **错误处理**：输入文件不存在、格式错误、输出目录不存在等情况要有友好提示
6. **README**：包含完整的使用说明、配置说明、示例、效果预览

---

## 七、开发优先级

请按以下顺序实现：

1. **P0 - 核心渐变生成**：能生成一张带文字的 SVG（pill 样式）
2. **P0 - 命令行批量生成**：读取 JSON 文件，批量输出 SVG
3. **P0 - 总览 HTML**：生成后自动创建 overview.html
4. **P1 - 多种文字排版**：实现 4 种文字方案
5. **P1 - 多套配色方案**：实现 6+ 套预设配色
6. **P1 - PNG 导出**：SVG → PNG
7. **P2 - Web 预览页面**：本地交互式预览
8. **P2 - 自定义配色**：支持用户传入自定义颜色
9. **P2 - 装饰元素**：边框、角标、logo 水印

---

## 八、示例效果描述

生成完成后，我期望看到的效果大概是：

- 一个 800×800 的正方形
- 背景是类似 OpenAI 官网那种柔和的、有机的、多色融合的渐变（不是简单的两色线性渐变，而是多个渐变层叠加产生的丰富色彩过渡）
- 中间偏下或正中有一个圆角矩形半透明白色标签
- 标签内是部门名称，字体清晰、现代
- 整体看起来像一个精致的部门 badge / 头像

这是给公司内部系统或飞书/企微工作台用的部门标识图，所以要 **专业但不死板，现代但不花哨**。

---

## 九、其他注意事项

- 请不要使用任何需要 API Key 的外部服务
- 所有依赖应该可以通过 npm install 安装
- 代码应该能在 macOS 和 Linux 上运行
- 如果使用 puppeteer 导出 PNG，请注意 chromium 的中文字体问题，可能需要安装 fonts-noto-cjk
- SVG 中的中文文字如果要保证跨平台一致性，可以考虑将文字转为 path（但这会增加文件体积，作为可选功能）
