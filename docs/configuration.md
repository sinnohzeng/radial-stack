# 配置参考

## 配置文件格式

配置文件使用 JSON 格式。默认配置定义在 `config/default.json`，这是所有配置项的**唯一事实来源（SSOT）**。

使用自定义配置文件：

```bash
node generate.js --name "技术部" --config my-config.json
```

## 配置优先级

配置项的优先级从高到低：

```
CLI 命令行参数  >  自定义配置文件 (--config)  >  config/default.json
```

实现逻辑见 `src/cli/index.js` 中的 `resolveConfig()` 函数。

## 配置项说明

以下所有配置项均可在配置文件中设置，也可通过 CLI 参数覆盖。完整默认值请查看 `config/default.json`。

### 基础配置

| 配置项 | 类型 | 默认值 | CLI 参数 | 说明 |
|--------|------|--------|----------|------|
| `size` | number | `800` | — | 画布尺寸（正方形，单位像素） |
| `palette` | string | `"warm"` | `-p, --palette` | 配色方案名称 |
| `layers` | number | `12` | `-l, --layers` | 渐变层数（1-30） |
| `blur` | number | `0` | `--blur` | 高斯模糊程度（0-50，0 为禁用） |
| `noise` | boolean | `false` | `--noise` | 启用噪声纹理 |
| `saturation` | number | `130` | `--saturation` | 饱和度滤镜百分比 |
| `textStyle` | string | `"pill"` | `-t, --text-style` | 文字排版方案 |
| `output` | string | `"./output"` | `-o, --output` | 输出目录 |
| `overview` | boolean | `true` | `--no-overview` | 是否生成总览 HTML |

### PNG 导出

| 配置项 | 类型 | 默认值 | CLI 参数 | 说明 |
|--------|------|--------|----------|------|
| `exportPNG` | boolean | `false` | `--png` | 同时导出 PNG 格式 |
| `pngSize` | number | `1024` | `--png-size` | PNG 输出尺寸（像素） |
| — | string | — | `--font-path` | PNG 导出使用的中文字体文件路径 |

### 高级配置

| 配置项 | 类型 | 默认值 | CLI 参数 | 说明 |
|--------|------|--------|----------|------|
| `seed` | string/number | — | `--seed` | 随机种子（默认由名称哈希生成） |
| `blendMode` | string | — | `--blend-mode` | CSS 混合模式（`soft-light`/`multiply`/`screen`） |
| `fontSize` | number | — | — | 覆盖自动字号（通常无需手动设置） |

### Pill 样式配置

在配置文件中通过 `pill` 对象设置：

```json
{
  "pill": {
    "bgColor": "rgba(255,255,255,0.88)",
    "textColor": "#333333",
    "borderRadius": 28,
    "paddingX": 40,
    "paddingY": 16
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `pill.bgColor` | string | `"rgba(255,255,255,0.88)"` | 胶囊背景色 |
| `pill.textColor` | string | `"#333333"` | 文字颜色 |
| `pill.borderRadius` | number | `28` | 圆角半径 |
| `pill.paddingX` | number | `40` | 水平内边距 |
| `pill.paddingY` | number | `16` | 垂直内边距 |

### Overlay 样式配置

在配置文件中通过 `overlay` 对象设置：

```json
{
  "overlay": {
    "textColor": "#ffffff",
    "shadowColor": "rgba(0,0,0,0.3)",
    "shadowBlur": 8
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `overlay.textColor` | string | `"#ffffff"` | 文字颜色 |
| `overlay.shadowColor` | string | `"rgba(0,0,0,0.3)"` | 阴影颜色 |
| `overlay.shadowBlur` | number | `8` | 阴影模糊半径 |

### 装饰元素配置

在配置文件中通过 `decorations` 对象设置：

```json
{
  "decorations": {
    "border": false,
    "borderColor": "rgba(255,255,255,0.1)",
    "borderWidth": 0.5,
    "cornerBadge": null,
    "logo": null
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `decorations.border` | boolean | `false` | 是否显示边框 |
| `decorations.borderColor` | string | `"rgba(255,255,255,0.1)"` | 边框颜色 |
| `decorations.borderWidth` | number | `0.5` | 边框宽度 |
| `decorations.cornerBadge` | string\|null | `null` | 右上角徽标文字（如 `"01"`） |
| `decorations.logo` | string\|null | `null` | SVG path 数据，用于右下角水印 |

## CLI 选项与配置文件的映射

```
CLI 参数                    配置文件字段
─────────────────────────  ──────────────
-i, --input <path>         (仅 CLI)
-n, --name <name>          (仅 CLI)
-o, --output <dir>         output
-c, --config <path>        (仅 CLI，指定配置文件)
-p, --palette <name>       palette
-t, --text-style <style>   textStyle
-l, --layers <n>           layers
--blur <n>                 blur
--noise                    noise
--saturation <n>           saturation
--seed <seed>              seed
--png                      exportPNG
--png-size <n>             pngSize
--font-path <path>         fontPath
--blend-mode <mode>        blendMode
--no-overview              overview: false
```

## 可用配色方案

8 套内置配色方案，详细定义见 `src/core/palettes.js`：

| 名称 | 标签 | 说明 |
|------|------|------|
| `warm` | 温暖活力 | 红橙粉系暖色调 |
| `cool` | 冷静科技 | 青蓝紫系冷色调 |
| `sunset` | 落日热情 | 红橙紫渐变 |
| `forest` | 自然生态 | 绿色系自然风 |
| `ocean` | 深邃专业 | 蓝色系深沉风 |
| `creative` | 创意多彩 | 霓虹撞色风 |
| `tech` | 科技未来 | 蓝紫科技风 |
| `elegant` | 优雅商务 | 金红深色系商务风 |

### 使用配色方案

```bash
# 使用内置方案
node generate.js --name "设计部" --palette creative

# 在配置文件中指定
{ "palette": "ocean" }
```

## 自定义配色方案

除了使用内置方案，还可以通过代码传入自定义颜色数组：

```javascript
import { buildSVG } from './src/core/svg-builder.js';

const svg = buildSVG({
  name: '品牌部',
  palette: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],  // 自定义颜色数组
});
```

传入数组时，第一个颜色将作为背景色。详细逻辑见 `src/core/palettes.js` 的 `resolvePalette()` 函数。

> **注意**：CLI 目前仅支持内置配色方案名称。自定义颜色数组需通过编程方式使用。

## 高级配置示例

### 启用装饰元素和混合模式

```json
{
  "palette": "tech",
  "textStyle": "overlay",
  "layers": 16,
  "saturation": 140,
  "blendMode": "soft-light",
  "decorations": {
    "border": true,
    "borderColor": "rgba(255,255,255,0.2)",
    "borderWidth": 1,
    "cornerBadge": "01"
  }
}
```

### 启用噪声纹理和模糊

```json
{
  "palette": "sunset",
  "blur": 5,
  "noise": true,
  "saturation": 125
}
```

> 所有配置项的默认值以 `config/default.json` 为准。
