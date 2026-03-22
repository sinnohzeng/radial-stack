# radial-stack

基于 **SVG 多层径向渐变叠加**技术的文本标识图生成器。

参照设计师 [Justin Jay Wang](https://justinjay.wang/methods-for-random-gradients/) 的渐变方法论，通过多层 `<radialGradient>` 配合 transform 变换链（scale / skewX / rotate / translate）生成有机、丰富的渐变背景，叠加中文文本标签，输出精致的标识图。

适用于：部门标识、产品 Logo 背景、活动海报、社交媒体头像、工作台图标等场景。

## 特性

- **SVG 矢量输出** — 每个文件仅 ~4KB，无限缩放，浏览器直接渲染
- **文字转轮廓** — 导出时可将文字转为 SVG `<path>`，不依赖字体（类似 Illustrator "创建轮廓"）
- **多行文本** — 支持换行输入，各布局模式智能适配多行
- **多分辨率 PNG 导出** — 支持 1K/HD/2K/4K/8K 分辨率预设，默认 4K
- **15+ 场景预设** — 电商主图、公众号封面、小红书、抖音、PPT、海报、壁纸等
- **12 套预设配色** — 含 4 套柔和粉彩配色（peach/mint/aurora/blush）
- **4 种文字样式** — 胶囊标签 / 大字叠加 / 竖排 / 纯渐变（无文字）
- **噪声纹理分级** — 关闭 / 低 / 中 / 高 四档可调，默认中等
- **深色 / 浅色主题** — 自动跟随系统偏好，可手动切换
- **5 种语言** — 简体中文 / 繁體中文 / English / 日本語 / 한국어
- **多语言字体** — 阿里巴巴普惠体 3.0 (SC) / Sans HK / Sans JP / Sans KR 按语言自动切换
- **自定义字体** — 支持上传 TTF/OTF 字体文件
- **文字排版控制** — 字号、字重、字间距、行间距、文字颜色可调
- **任意宽高比** — 支持矩形画布，预设或自定义 width/height
- **可复现** — 相同种子 + 配置 = 完全一致的输出
- **交互式 Web 预览** — Tab 分组面板，实时调参，所见即所得
- **OKLCH 颜色科学** — 感知均匀的颜色插值，告别 RGB 的灰暗中间色
- **共享核心架构** — CLI 和 Web 复用同一份渐变/排版代码
- **完整 a11y** — ARIA 标注、键盘导航、WCAG AA 对比度达标
- **响应式布局** — 桌面 / 平板 / 手机三档自适应

## 快速开始

```bash
# 安装依赖（需要 Node.js >= 24）
npm install

# 生成单张标识图
node generate.js --name "综合管理部"

# 批量生成
node generate.js --input examples/departments.json --output ./output/

# 指定配色和文字样式
node generate.js --name "产品设计部" --palette creative --text-style overlay

# 使用场景预设 + 分辨率预设
node generate.js --name "技术研发中心" --preset banner-wide --resolution 4k --png

# 文字转轮廓导出
node generate.js --name "设计部" --font-path web/public/fonts/AlibabaPuHuiTi-3-75-SemiBold.woff2 --outline

# 列出所有可用预设
node generate.js --list-presets

# 同时导出 PNG
node generate.js --name "技术研发中心" --png

# 启动 Web 预览
npm run dev
```

## 命令行选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-i, --input <path>` | 输入文件（JSON/CSV/TXT） | — |
| `-n, --name <name>` | 单条文本（支持 `\n` 换行） | — |
| `-o, --output <dir>` | 输出目录 | `./output` |
| `-p, --palette <name>` | 配色方案 | `warm` |
| `-t, --text-style <style>` | 文字样式 | `pill` |
| `-l, --layers <n>` | 渐变层数（1-30） | `12` |
| `--blur <n>` | 模糊程度（0-50） | `3` |
| `--noise` | 启用噪声纹理 | `false` |
| `--saturation <n>` | 饱和度 % | `130` |
| `--seed <seed>` | 随机种子 | 自动 |
| `--preset <name>` | 场景预设（如 banner-wide） | `square` |
| `--resolution <name>` | 分辨率预设（standard/hd/2k/4k/8k） | `standard` |
| `--width <n>` | 自定义画布宽度 | — |
| `--height <n>` | 自定义画布高度 | — |
| `--font-path <path>` | 字体文件路径（TTF/OTF/WOFF2） | — |
| `--outline` | 将文字转为轮廓路径（需配合 --font-path） | `false` |
| `--png` | 同时导出 PNG | `false` |
| `--png-size <n>` | PNG 尺寸（像素） | `1024` |
| `--list-presets` | 列出所有可用预设 | — |

完整选项说明见 [配置文档](docs/configuration.md)。

## 输入格式

支持 JSON、纯文本和 CSV 三种格式：

**JSON**（推荐，支持逐条配色提示）：
```json
[
  { "name": "综合管理部", "color_hint": "warm" },
  { "name": "技术研发中心", "color_hint": "cool" },
  { "name": "产品设计部", "color_hint": "creative" }
]
```

**TXT**（每行一条文本）：
```
综合管理部
技术研发中心
产品设计部
```

## 配色方案

| 方案 | 关键词 | 色彩方向 | 基底 |
|------|--------|----------|------|
| `warm` | 温暖、活力 | 橙、粉、桃、珊瑚 | 深色 |
| `cool` | 冷静、科技 | 蓝、青、靛、薄荷 | 深色 |
| `sunset` | 落日、热情 | 红橙、紫红、金 | 深色 |
| `forest` | 自然、生态 | 翠绿、橄榄、苔藓 | 深色 |
| `ocean` | 深邃、专业 | 深蓝、湖蓝、蓝绿 | 深色 |
| `creative` | 创意、多彩 | 紫、品红、青、柠檬 | 深色 |
| `tech` | 科技、未来 | 深灰、电光蓝、霓虹紫 | 深色 |
| `elegant` | 优雅、商务 | 黑、金、深酒红 | 深色 |
| `peach` | 桃粉、柔和 | 桃橙、粉、薰衣草 | 浅色 |
| `mint` | 薄荷、清新 | 薄荷绿、天蓝、柠黄 | 浅色 |
| `aurora` | 极光、梦幻 | 浅紫、浅蓝、浅粉 | 浅色 |
| `blush` | 腮红、暖粉 | 暖粉、杏、玫红 | 浅色 |

也支持自定义颜色数组，详见 [配置文档](docs/configuration.md)。

## Web 预览

```bash
npm run dev       # 启动 Vite 开发服务器（热更新）
npm run build     # 构建生产版本到 dist/
npm run preview   # 预览构建产物
```

打开 `http://localhost:3000/`，可以：
- 输入文本（支持多行），实时预览渐变效果
- 切换配色方案和文字样式（胶囊/叠加/竖排/无文字）
- 调节渐变层数、饱和度、模糊等参数
- 选择噪声纹理强度（关闭/低/中/高）
- 选择场景预设和导出分辨率（显示实际像素尺寸）
- 加载自定义字体，开启文字轮廓化导出
- 切换深色/浅色主题，切换界面语言
- 一键下载 SVG 或 PNG

## 部署

项目已配置 Cloudflare Pages 部署支持（含 `_headers` 缓存规则、SPA 路由）。

**GitHub 集成（推荐）：**
1. Cloudflare Dashboard → Pages → Create project → 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 输出目录：`dist`

**CLI 手动部署：**
```bash
npm run build && npx wrangler pages deploy dist --project-name=radial-stack
```

## 技术架构

```
src/core/              ← 纯函数核心（浏览器 + Node.js 共用）
├── svg-builder.js     # SVG 组装（主入口）
├── gradient.js        # 多层 radialGradient 渐变生成
├── text-layout.js     # 4 种文字排版 + 多行支持
├── text-outliner.js   # 文字转 SVG 路径（opentype.js）
├── palettes.js        # 12 套配色方案
├── presets.js         # 15+ 场景预设 + 5 档分辨率预设
├── color-utils.js     # OKLCH 色彩空间转换
└── utils.js           # seedrandom、XML 转义

src/cli/               ← Node.js CLI 专属
├── index.js           # 命令行入口
├── png-export.js      # PNG 导出（含中文字体检测）
├── file-reader.js     # 多格式输入解析
└── overview.js        # 总览 HTML 生成

web/                   ← Web 预览界面（Vite 构建）
├── index.html         # HTML 结构（Tab 面板 + ARIA 标注）
├── main.js            # 入口 + 预览 + 事件绑定
├── state.js           # Proxy 化状态管理
├── export.js          # SVG/PNG 导出
├── i18n.js            # 5 语言国际化（按需加载）
├── i18n/              # 独立 locale JSON 文件
├── utils.js           # debounce 等工具
├── theme.js           # 深色/浅色主题
├── fonts.js           # 语言字体管理
├── style.css          # 样式（深浅主题 + 响应式）
└── public/
    ├── fonts/         # WOFF2 字体文件（4 语言 13 个字重）
    ├── wawoff2-decompress.js  # WOFF2 解压 WASM（本地化）
    ├── _headers       # Cloudflare Pages 缓存规则
    └── _redirects     # SPA 路由
```

详细架构说明见 [架构文档](docs/architecture.md)。

## 工程化

| 工具 | 用途 | 命令 |
|------|------|------|
| ESLint 10 | 代码检查（flat config） | `npm run lint` |
| Prettier | 代码格式化 | `npm run format` |
| Vitest 4 | 单元测试 + 快照测试 | `npm test` |
| GitHub Actions | CI（push 触发 lint + test） | 自动 |
| Cloudflare Pages | CD（连接 GitHub 自动部署） | 自动 |

## 文档

| 文档 | 内容 |
|------|------|
| [架构设计](docs/architecture.md) | 渐变算法原理、OKLCH 颜色科学、模块设计 |
| [配置参考](docs/configuration.md) | 全部配置项、CLI 选项映射、高级用法 |
| [API 参考](docs/api-reference.md) | 核心模块的程序化调用方式 |
| [故障排除](docs/troubleshooting.md) | 常见问题与解决方案 |
| [贡献指南](docs/contributing.md) | 开发环境、代码规范、如何贡献 |
| [变更日志](CHANGELOG.md) | 版本历史与变更记录 |

## 测试

```bash
npm test          # 运行全部测试
npm run test:watch  # 监视模式
```

项目包含 208 个测试，覆盖渐变生成、文字排版、配色方案、颜色转换、XML 转义、可复现性和 SVG 快照回归。

## 灵感来源

本项目的渐变技术参照了设计师 Justin Jay Wang 在其文章 [Methods for Random Gradients](https://justinjay.wang/methods-for-random-gradients/) 中记录的 SVG 渐变方法论。我们分析了其公开的 SVG 源码，提取了核心算法（多层 radialGradient + transform 变换链），并在此基础上增强了颜色科学（OKLCH 插值）和可配置性。

## 许可证

[MIT](LICENSE) © 2026 Zeng Zixuan
