# 变更日志

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.2.0] - 2026-03-21

### 工程化

- **Node.js 24 LTS**：从 EOL 的 Node 18 升级到最新 LTS（v24 Krypton）
- **ESLint 10 + Prettier**：新增代码规范工具链（flat config），`npm run lint` / `npm run format`
- **GitHub Actions CI**：每次 push 自动运行 lint + test
- **EditorConfig**：统一编辑器基础规范

### 架构重构

- **State Proxy 化**：`state.js` 改用 `Proxy` 实现变更追踪，支持 `onChange` 监听
- **事件绑定抽象**：提取 `bindOptionGroup()` 通用函数，消除 4 处重复的 click delegation 模式
- **Debounce**：所有 slider/textarea 输入节流 150ms，大幅减少 SVG 重建频率
- **Magic numbers 语义化**：`PILL_DEFAULTS`、`VERTICAL_COL_SPACING_RATIO`、`NOISE_FREQUENCY_MAP` 等
- **全局错误兜底**：新增 `unhandledrejection` handler

### i18n 完善

- **字典拆分**：572 行内联字典拆为 5 个独立 JSON 文件（`web/i18n/*.json`），Vite 自动 code-split
- **硬编码清理**：8 处硬编码中文替换为 `t()` 调用
- **新增 4 个 i18n key**：`app.title`、`placeholder.default_name`、`msg.svg_parse_error`、`file.default_name`
- **HTML lang 动态更新**：切换语言时同步更新 `<html lang>` 和 `<title>`
- **optgroup/aria-label i18n 支持**：`applyTranslations()` 新增 `data-i18n-label`、`data-i18n-aria-label`

### 可访问性 (a11y)

- **ARIA 标注**：Tab 组件 `role="tablist/tab/tabpanel"` + `aria-selected`
- **键盘导航**：Tab 支持方向键切换，自定义控件（palette/style/noise/resolution）添加 `tabindex` + `role="radio"`
- **表单关联**：slider/select 添加 `<label for="">` 关联
- **对比度修复**：暗色主题 `--text-3` 从 `#68687a` 提升到 `#8888a0`（WCAG AA 达标）
- **Focus 可见性**：全局 `:focus-visible` 样式
- **Icon button aria-label**：所有 icon button 添加可访问名称

### 导出修复

- **PNG 导出**：新增 `img.onerror` handler + `toBlob` 失败保护 + ObjectURL 内存泄漏修复
- **默认文件名 i18n 化**：导出文件名随语言切换

### 响应式

- **新增 520px 手机断点**：优化小屏布局、触摸目标 44px 最小尺寸
- 调整 tablet 断点下的 preview-frame 尺寸

### 其他

- **HTML meta 完善**：`theme-color`、`description`、SVG emoji favicon
- **WASM 本地化**：wawoff2 从 unpkg CDN 迁移到本地 `/wawoff2-decompress.js`
- **SVG 快照测试**：4 个 snapshot 测试用例，保护渐变算法稳定性
- **版本号更新**：header tag 从 v2.0 更新为 v2.1
- 测试从 204 增加到 208（含快照测试）

---

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
