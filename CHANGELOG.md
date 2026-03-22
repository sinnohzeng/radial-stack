# 变更日志

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2026-03-21

### 新增

- **场景预设系统**：15+ 场景预设（电商、社交媒体、设计、壁纸），类似 Illustrator 新建画板
- **分辨率预设**：standard(1K) / HD / 2K / 4K / 8K 五档分辨率
- **矩形画布**：支持任意 width/height 宽高比，不再限于正方形
- **4 套柔和配色**：peach(桃粉) / mint(薄荷) / aurora(极光) / blush(腮红)，浅色基底
- **纯渐变模式**：textStyle: 'none' 生成无文字的纯渐变背景
- CLI 新增 `--preset`、`--resolution`、`--width`、`--height`、`--list-presets` 选项

### 构建与部署

- **Vite 构建工具**：引入 Vite 打包，解决浏览器 bare specifier 导入问题
- **Cloudflare Pages 部署支持**：`_headers`（安全头 + 缓存策略）、`_redirects`（SPA fallback）
- **Web 代码拆分**：将 767 行单文件 `index.html` 拆分为 `index.html` + `style.css` + `main.js`
- **新增开发命令**：`npm run dev`（Vite 热更新）、`npm run build`、`npm run preview`
- Node 版本锁定（`.node-version`）

### 变更

- 默认渐变层数从 12 调整为 8（更清晰的色块分离）
- 默认模糊从 0 调整为 3（更柔和的边缘过渡）
- 渐变焦点 fy 从固定 0.5 改为随机化（0.1-0.9），色彩分布更丰富
- 渐变缩放范围从 0.7-1.5 扩大到 0.5-2.0（更大胆的色块变化）
- Web 预览从 Python HTTP server 迁移至 Vite dev server
- 移除了项目中所有第三方公司品牌引用

---

## [1.0.0] - 2026-03-21

### 新增

- **核心渐变引擎**：基于 SVG 多层径向渐变叠加技术
  - 12 层 `<radialGradient>` 配合 transform 变换链
  - `filter:saturate()` 饱和度增强
  - 可选 `<feGaussianBlur>` 和 `<feTurbulence>` 滤镜
- **OKLCH 颜色科学**：使用 culori 库实现感知均匀的颜色插值
- **8 套预设配色方案**：warm / cool / sunset / forest / ocean / creative / tech / elegant
- **4 种文字排版**：胶囊标签 / 大字叠加 / 竖排 / 拆字艺术
- **命令行工具**：支持单条生成和批量生成（JSON/CSV/TXT 输入）
- **PNG 导出**：通过 @resvg/resvg-js，自动检测系统中文字体
- **总览 HTML**：批量生成后自动创建 overview.html
- **交互式 Web 预览**：实时调参、配色切换、SVG/PNG 下载
- **可复现性**：种子化随机数保证相同输入产生相同输出
- **XML 安全**：所有文本内容经过转义处理
- **204 个单元测试**：覆盖核心功能和边界情况
