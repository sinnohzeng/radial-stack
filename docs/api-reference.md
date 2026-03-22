# API 参考

本项目的核心模块（`src/core/`）可以作为独立库在 Node.js 或浏览器环境中编程调用。

## 快速开始

```javascript
import { buildSVG } from './src/core/svg-builder.js';

const svg = buildSVG({
  name: '技术部',
  palette: 'cool',
  textStyle: 'overlay',
});

// svg 是完整的 SVG 字符串，可直接写入文件或嵌入 HTML
```

## 核心模块

### svg-builder.js — 主入口

**路径**：`src/core/svg-builder.js`

#### `buildSVG(options): string`

组装并返回一个完整的 SVG 字符串。这是最常用的入口函数。

**参数** `BuildOptions`：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | `string` | 是 | — | 部门/标识名称 |
| `size` | `number` | 否 | `800` | 画布尺寸（正方形） |
| `palette` | `string \| string[]` | 否 | `'warm'` | 配色方案名称或自定义颜色数组 |
| `seed` | `string \| number` | 否 | 名称哈希 | 随机种子 |
| `layers` | `number` | 否 | `12` | 渐变叠加层数 |
| `blur` | `number` | 否 | `0` | 高斯模糊（0 = 禁用） |
| `noise` | `boolean` | 否 | `false` | 噪声纹理 |
| `saturation` | `number` | 否 | `130` | 饱和度百分比 |
| `textStyle` | `string` | 否 | `'pill'` | 文字排版方案 |
| `fontSize` | `number` | 否 | 自动 | 覆盖自动字号 |
| `blendMode` | `string` | 否 | — | CSS 混合模式 |
| `decorations` | `object` | 否 | `{}` | 装饰元素配置 |
| `pill` | `object` | 否 | — | Pill 样式配置 |
| `overlay` | `object` | 否 | — | Overlay 样式配置 |

**返回值**：完整的 SVG XML 字符串。

**示例**：

```javascript
// 最简调用
const svg1 = buildSVG({ name: '人力资源部' });

// 完整配置
const svg2 = buildSVG({
  name: '设计中心',
  size: 1200,
  palette: 'creative',
  seed: 42,
  layers: 16,
  blur: 3,
  noise: true,
  saturation: 140,
  textStyle: 'artistic',
  blendMode: 'soft-light',
  decorations: {
    border: true,
    cornerBadge: '01',
  },
});
```

---

### gradient.js — 渐变算法

**路径**：`src/core/gradient.js`

#### `generateGradientDefs(paletteColors, rng, layerCount): { defs, gradientIds }`

生成 SVG `<radialGradient>` 定义。

| 参数 | 类型 | 说明 |
|------|------|------|
| `paletteColors` | `string[]` | 配色方案的颜色数组（hex 格式） |
| `rng` | `() => number` | 种子随机数生成器 |
| `layerCount` | `number` | 渐变层数 |

**返回值**：
- `defs` — SVG `<radialGradient>` 定义字符串
- `gradientIds` — 渐变 ID 数组（如 `['rg0', 'rg1', 'rg2', 'rg3']`）

#### `generateGradientStyles(background, gradientIds): string`

生成 CSS `<style>` 块，包含背景色和渐变填充规则。

| 参数 | 类型 | 说明 |
|------|------|------|
| `background` | `string` | 基础背景色 |
| `gradientIds` | `string[]` | 渐变 ID 数组 |

#### `generateGradientLayers(gradientIds, rng, layerCount, size): string`

生成叠加的 `<rect>` 元素，每层具有独立的变换链和不透明度。

| 参数 | 类型 | 说明 |
|------|------|------|
| `gradientIds` | `string[]` | 渐变 ID 数组 |
| `rng` | `() => number` | 种子随机数生成器 |
| `layerCount` | `number` | 层数 |
| `size` | `number` | 画布尺寸 |

---

### palettes.js — 配色方案

**路径**：`src/core/palettes.js`

#### `resolvePalette(nameOrColors): Palette`

根据名称字符串或自定义颜色数组解析配色方案。传入未知名称会抛出错误。

```javascript
import { resolvePalette } from './src/core/palettes.js';

const p1 = resolvePalette('ocean');
// => { name: 'ocean', label: '深邃专业', colors: [...], background: '#0C2340' }

const p2 = resolvePalette(['#FF0000', '#00FF00', '#0000FF']);
// => { name: 'custom', label: '自定义', colors: [...], background: '#FF0000' }
```

#### `getPalette(name): Palette | undefined`

按名称获取内置配色方案。

#### `getAllPaletteNames(): string[]`

返回所有内置配色方案名称。

#### `getAllPalettes(): Palette[]`

返回所有内置配色方案对象数组。

#### `hintToPaletteName(hint): string`

将颜色提示关键词映射为配色方案名称。支持别名（如 `'hot'` -> `'warm'`，`'sea'` -> `'ocean'`）。

#### Palette 类型

```typescript
interface Palette {
  name: string;       // 标识名
  label: string;      // 中文显示名
  colors: string[];   // 4-7 个 hex 颜色
  background: string; // 基础背景色
}
```

---

### text-layout.js — 文字排版

**路径**：`src/core/text-layout.js`

#### `layoutText(style, name, size, config?, rng?): string`

根据样式名路由到对应的排版函数。

| 参数 | 类型 | 说明 |
|------|------|------|
| `style` | `string` | `'pill'` / `'overlay'` / `'vertical'` / `'artistic'` |
| `name` | `string` | 显示文字 |
| `size` | `number` | 画布尺寸 |
| `config` | `TextConfig` | 可选配置 |
| `rng` | `() => number` | 随机数生成器（artistic 样式需要） |

#### `autoFontSize(name): number`

根据字符数自动计算字号。2 字 80px，逐步递减至 `max(32, 320/len)`。

#### `pillLayout(name, size, config?): string`

生成胶囊标签样式的 SVG 元素。

#### `overlayLayout(name, size, config?): string`

生成叠加文字样式的 SVG 元素。

#### `verticalLayout(name, size, config?): string`

生成竖排文字样式的 SVG 元素。

#### `artisticLayout(name, size, config?, rng?): string`

生成艺术散落样式的 SVG 元素。

---

### color-utils.js — OKLCH 颜色工具

**路径**：`src/core/color-utils.js`

依赖 `culori` 库进行 OKLCH 颜色空间转换。

#### `hexToOklch(hex): { l, c, h }`

将 hex 颜色转换为 OKLCH 对象。

#### `oklchToHex(color): string`

将 OKLCH 对象转换为 hex 字符串。

#### `interpolateColors(color1, color2, t): string`

在 OKLCH 空间中插值两个 hex 颜色。`t` 为插值因子 [0, 1]。

#### `midpointColor(color1, color2): string`

返回两个颜色的 OKLCH 中间色（等同于 `interpolateColors(c1, c2, 0.5)`）。

---

### utils.js — 通用工具

**路径**：`src/core/utils.js`

#### `createRng(seed): () => number`

创建种子随机数生成器（基于 `seedrandom` 库），返回 [0, 1) 范围的随机数函数。

#### `pickRandom(array, rng): T`

从数组中随机选取一个元素。

#### `randomRange(min, max, rng): number`

生成 [min, max) 范围内的随机浮点数。

#### `hashString(str): number`

djb2 字符串哈希，返回稳定的正整数。用于将名称转换为默认种子。

#### `escapeXml(str): string`

转义 XML 特殊字符（`&`、`<`、`>`、`"`、`'`），防止 SVG 格式错误。

#### `clamp(value, min, max): number`

将数值限制在 [min, max] 范围内。

---

## CLI 模块

CLI 模块位于 `src/cli/`，仅在 Node.js 环境中使用。

### png-export.js — PNG 导出

**路径**：`src/cli/png-export.js`

#### `svgToPng(svgString, options?): { buffer, warnings }`

将 SVG 字符串转换为 PNG Buffer。使用 `@resvg/resvg-js` 进行渲染。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `svgString` | `string` | — | SVG 字符串 |
| `options.width` | `number` | `1024` | 输出宽度 |
| `options.height` | `number` | `1024` | 输出高度 |
| `options.fontPath` | `string` | 自动检测 | 中文字体文件路径 |

自动检测系统中文字体：
- macOS：`/System/Library/Fonts/PingFang.ttc`
- Linux：多个 Noto CJK 路径

## 与 CLI 的关系

CLI（`src/cli/index.js`）是核心模块的一层薄封装，负责：

1. 解析命令行参数（使用 `commander`）
2. 合并配置优先级：CLI 参数 > 配置文件 > 默认值
3. 读取输入文件（JSON/CSV/TXT）
4. 调用 `buildSVG()` 生成 SVG
5. 可选调用 `svgToPng()` 导出 PNG
6. 生成总览 HTML

如果你需要将生成功能集成到自己的项目中，**直接 import 核心模块**即可，无需依赖 CLI。

## 编程使用示例

### 批量生成 SVG

```javascript
import { buildSVG } from './src/core/svg-builder.js';
import { writeFileSync } from 'fs';

const departments = ['技术部', '设计部', '市场部', '人力资源部'];

departments.forEach(name => {
  const svg = buildSVG({ name, palette: 'cool', textStyle: 'overlay' });
  writeFileSync(`output/${name}.svg`, svg, 'utf-8');
});
```

### 在浏览器中使用

```html
<script type="module">
import { buildSVG } from './src/core/svg-builder.js';

const svg = buildSVG({ name: '前端组', palette: 'tech' });
document.getElementById('preview').textContent = svg;
// 或使用 DOM API 安全地插入 SVG 元素
</script>
```

### 自定义颜色 + 装饰

```javascript
const svg = buildSVG({
  name: '品牌部',
  palette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  textStyle: 'pill',
  decorations: {
    border: true,
    borderColor: 'rgba(233,69,96,0.3)',
    cornerBadge: 'BRAND',
  },
});
```

### 颜色工具独立使用

```javascript
import { hexToOklch, interpolateColors } from './src/core/color-utils.js';

const oklch = hexToOklch('#FF5828');
console.log(oklch); // { l: 0.68, c: 0.21, h: 42.5 }

const mid = interpolateColors('#FF0000', '#0000FF', 0.5);
console.log(mid); // 红蓝中间色（OKLCH 插值，不会出现灰褐色）
```

> 完整的类型定义以各源文件中的 JSDoc `@typedef` 为准。
