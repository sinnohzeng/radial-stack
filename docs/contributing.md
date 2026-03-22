# 贡献指南

## 开发环境搭建

### 前置要求

- **Node.js** 18 或更高版本
- **npm**（随 Node.js 一起安装）

### 安装步骤

```bash
git clone <repo-url>
cd gradient-background-generator
npm install
```

### 验证安装

```bash
# 运行测试
npm test

# 生成一个测试图片
node generate.js --name "测试"

# 启动 Web 预览
npm run preview
```

## 项目结构说明

```
gradient-background-generator/
├── generate.js            CLI 入口脚本
├── package.json           项目配置（ESM, scripts, 依赖）
├── config/
│   └── default.json       默认配置（SSOT）
├── src/
│   ├── core/              共享核心模块（浏览器 + Node.js 通用）
│   │   ├── svg-builder.js     主入口，组装 SVG
│   │   ├── gradient.js        渐变算法
│   │   ├── palettes.js        配色方案定义
│   │   ├── text-layout.js     文字排版方案
│   │   ├── color-utils.js     OKLCH 颜色工具
│   │   └── utils.js           通用工具函数
│   └── cli/               CLI 专用模块
│       ├── index.js           命令行参数与流程
│       ├── png-export.js      SVG 转 PNG
│       ├── file-reader.js     输入文件解析
│       └── overview.js        总览 HTML 生成
├── web/                   Web 预览界面
├── tests/                 测试文件
│   ├── utils.test.js
│   ├── color-utils.test.js
│   ├── palettes.test.js
│   ├── gradient.test.js
│   ├── text-layout.test.js
│   ├── svg-builder.test.js
│   └── reproducibility.test.js
├── examples/              示例文件
├── docs/                  文档
└── output/                默认输出目录
```

## 代码规范

### ESM 模块

项目使用原生 ES Module。`package.json` 中设置了 `"type": "module"`。

- 使用 `import`/`export`，不使用 `require`/`module.exports`
- 文件扩展名必须为 `.js`，import 路径必须包含扩展名

```javascript
// 正确
import { buildSVG } from './svg-builder.js';

// 错误
const { buildSVG } = require('./svg-builder');
```

### JSDoc + @ts-check

项目采用 **JSDoc 类型注解 + `@ts-check`** 方案，不使用 TypeScript 编译步骤。

每个源文件顶部应包含 `// @ts-check`，所有导出函数必须有 JSDoc 类型注解：

```javascript
// @ts-check

/**
 * 函数说明。
 * @param {string} name - 参数说明
 * @param {number} [size=800] - 可选参数
 * @returns {string} 返回值说明
 */
export function myFunction(name, size = 800) {
  // ...
}
```

使用 `@typedef` 定义复杂类型：

```javascript
/**
 * @typedef {Object} MyConfig
 * @property {string} name
 * @property {number} [size]
 */
```

### 代码风格

- 使用 2 空格缩进
- 字符串使用单引号
- 函数和变量使用 camelCase
- 常量对象使用 UPPER_SNAKE_CASE（如 `PALETTES`、`CJK_FONT_PATHS`）
- `core/` 模块中不能引入 Node.js 特有 API

## 测试规范

项目使用 [vitest](https://vitest.dev/) 作为测试框架。

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时推荐）
npm run test:watch
```

### 测试文件命名

测试文件放在 `tests/` 目录下，命名格式为 `<模块名>.test.js`。每个 `src/core/` 模块对应一个测试文件。

### 编写测试

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/core/my-module.js';

describe('myFunction', () => {
  it('应该返回预期结果', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('应该处理边界情况', () => {
    expect(() => myFunction('')).toThrow();
  });
});
```

### 可复现性测试

项目包含 `tests/reproducibility.test.js`，验证相同输入（名称 + 种子）始终生成相同的 SVG 输出。添加新功能时请确保不破坏这一特性。

## 如何添加新配色方案

配色方案定义在 `src/core/palettes.js` 的 `PALETTES` 对象中。

### 步骤

1. **编辑 `src/core/palettes.js`**，在 `PALETTES` 对象中添加新条目：

```javascript
const PALETTES = {
  // ... 现有方案 ...

  midnight: {
    name: 'midnight',
    label: '午夜深蓝',
    colors: ['#191970', '#000080', '#4169E1', '#6495ED', '#B0C4DE'],
    background: '#0A0A2A',
  },
};
```

2. **（可选）添加别名映射**。如果希望支持关键词别名，在 `hintToPaletteName()` 函数的 `map` 对象中添加：

```javascript
const map = {
  // ... 现有映射 ...
  midnight: 'midnight',
  night: 'midnight',    // 别名
  dark: 'midnight',     // 别名
};
```

3. **添加测试**。在 `tests/palettes.test.js` 中添加对应测试用例，确保新方案能正确解析。

4. **验证效果**：

```bash
node generate.js --name "测试" --palette midnight
```

### 配色方案设计指南

- `colors` 数组包含 4-7 个 hex 颜色，用于渐变色标
- `background` 是基础背景色，通常选择颜色中较深的一个
- `label` 是中文显示名，用于 Web 预览界面
- 颜色之间应有足够的对比度和色相差异，以产生丰富的渐变效果
- 使用 OKLCH 颜色空间思考：确保颜色在感知上均匀分布

## 如何添加新文字排版方案

文字排版方案定义在 `src/core/text-layout.js` 中。

### 步骤

1. **编辑 `src/core/text-layout.js`**，添加新的排版函数：

```javascript
/**
 * Generate my-style layout SVG elements.
 *
 * @param {string} name
 * @param {number} size
 * @param {TextConfig} [config={}]
 * @param {() => number} [rng]
 * @returns {string}
 */
export function myStyleLayout(name, size, config = {}, rng) {
  const escaped = escapeXml(name);
  const fontSize = config.fontSize || autoFontSize(name);

  // 返回 SVG 元素字符串
  return `
  <text x="${size / 2}" y="${size / 2}" ...>${escaped}</text>`;
}
```

2. **在 `layoutText()` 路由函数中注册**：

```javascript
export function layoutText(style, name, size, config = {}, rng) {
  switch (style) {
    case 'pill': return pillLayout(name, size, config);
    case 'overlay': return overlayLayout(name, size, config);
    case 'vertical': return verticalLayout(name, size, config);
    case 'artistic': return artisticLayout(name, size, config, rng);
    case 'my-style': return myStyleLayout(name, size, config, rng);  // 新增
    default: return pillLayout(name, size, config);
  }
}
```

3. **更新 CLI 验证**。在 `src/cli/index.js` 的 `validateConfig()` 中添加新样式名到 `validStyles` 数组：

```javascript
const validStyles = ['pill', 'overlay', 'vertical', 'artistic', 'my-style'];
```

4. **添加测试**。在 `tests/text-layout.test.js` 中添加对应测试用例。

5. **验证效果**：

```bash
node generate.js --name "测试" --text-style my-style
```

### 排版方案设计指南

- 函数签名应与现有方案保持一致：`(name, size, config?, rng?) => string`
- 返回值是 SVG 元素字符串（不包含外层 `<svg>` 标签）
- 使用 `escapeXml()` 处理文字内容
- 使用 `autoFontSize()` 作为默认字号，允许 `config.fontSize` 覆盖
- 如果需要随机效果，使用传入的 `rng` 参数（确保可复现性）
- 字体族使用文件顶部定义的 `FONT_FAMILY` 常量

## 提交 Pull Request

1. 确保所有测试通过：`npm test`
2. 确保新功能有对应的测试覆盖
3. 确保 `core/` 模块中没有引入 Node.js 特有 API
4. 提交信息建议使用中文，简明描述变更内容

> 源码中的 JSDoc 注解是类型信息的唯一来源。修改函数签名时请同步更新 JSDoc。
