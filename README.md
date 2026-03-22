# radial-stack

基于 **SVG 多层径向渐变叠加**技术的文本标识图生成器。

参照设计师 [Justin Jay Wang](https://justinjay.wang/methods-for-random-gradients/) 的渐变方法论，通过多层 `<radialGradient>` 配合 transform 变换链（scale / skewX / rotate / translate）生成有机、丰富的渐变背景，叠加中文文本标签，输出精致的标识图。

适用于：部门标识、产品 Logo 背景、活动海报、社交媒体头像、工作台图标等场景。

## 特性

- **SVG 矢量输出** — 每个文件仅 ~4KB，无限缩放，浏览器直接渲染
- **多分辨率 PNG 导出** — 支持 1K/HD/2K/4K/8K 分辨率预设
- **15+ 场景预设** — 电商主图、公众号封面、小红书、抖音、PPT、海报、壁纸等
- **12 套预设配色** — 含 4 套柔和粉彩配色（peach/mint/aurora/blush）
- **5 种文字样式** — 胶囊标签 / 大字叠加 / 竖排 / 拆字艺术 / 纯渐变（无文字）
- **任意宽高比** — 支持矩形画布，预设或自定义 width/height
- **可复现** — 相同种子 + 配置 = 完全一致的输出
- **交互式 Web 预览** — 实时调参，所见即所得
- **OKLCH 颜色科学** — 感知均匀的颜色插值，告别 RGB 的灰暗中间色
- **共享核心架构** — CLI 和 Web 复用同一份渐变/排版代码

## 快速开始

```bash
# 安装依赖
npm install

# 生成单张标识图
node generate.js --name "综合管理部"

# 批量生成
node generate.js --input examples/departments.json --output ./output/

# 指定配色和文字样式
node generate.js --name "产品设计部" --palette creative --text-style overlay

# 使用场景预设 + 分辨率预设
node generate.js --name "技术研发中心" --preset banner-wide --resolution 4k --png

# 列出所有可用预设
node generate.js --list-presets

# 同时导出 PNG
node generate.js --name "技术研发中心" --png

# 启动 Web 预览
npm run preview
# 然后打开 http://localhost:3000/web/index.html
```

## 命令行选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-i, --input <path>` | 输入文件（JSON/CSV/TXT） | — |
| `-n, --name <name>` | 单条文本 | — |
| `-o, --output <dir>` | 输出目录 | `./output` |
| `-p, --palette <name>` | 配色方案 | `warm` |
| `-t, --text-style <style>` | 文字样式 | `pill` |
| `-l, --layers <n>` | 渐变层数（1-30） | `8` |
| `--blur <n>` | 模糊程度（0-50） | `3` |
| `--noise` | 启用噪声纹理 | `false` |
| `--saturation <n>` | 饱和度 % | `130` |
| `--seed <seed>` | 随机种子 | 自动 |
| `--preset <name>` | 场景预设（如 banner-wide） | `square` |
| `--resolution <name>` | 分辨率预设（standard/hd/2k/4k/8k） | `standard` |
| `--width <n>` | 自定义画布宽度 | — |
| `--height <n>` | 自定义画布高度 | — |
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
- 输入文本，实时预览渐变效果
- 切换配色方案和文字样式
- 调节渐变层数、饱和度、模糊等参数
- 选择场景预设和导出分辨率
- 一键下载 SVG 或 PNG

## 部署

项目已配置 Cloudflare Pages 部署支持。

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
src/core/          ← 纯函数核心（浏览器 + Node.js 共用）
├── svg-builder.js # SVG 组装（主入口）
├── gradient.js    # 多层 radialGradient 渐变生成
├── text-layout.js # 4 种文字排版
├── palettes.js    # 12 套配色方案
├── presets.js     # 15+ 场景预设 + 5 档分辨率预设
├── color-utils.js # OKLCH 色彩空间转换
└── utils.js       # seedrandom、XML 转义

src/cli/           ← Node.js CLI 专属
├── index.js       # 命令行入口
├── png-export.js  # PNG 导出（含中文字体检测）
├── file-reader.js # 多格式输入解析
└── overview.js    # 总览 HTML 生成

web/               ← Web 预览界面（Vite 构建）
├── index.html     # HTML 结构
├── main.js        # 交互逻辑（import 核心模块）
├── style.css      # 样式
└── public/        # 静态资源（_headers, _redirects）
```

详细架构说明见 [架构文档](docs/architecture.md)。

## 文档

| 文档 | 内容 |
|------|------|
| [架构设计](docs/architecture.md) | 渐变算法原理、OKLCH 颜色科学、模块设计 |
| [配置参考](docs/configuration.md) | 全部配置项、CLI 选项映射、高级用法 |
| [API 参考](docs/api-reference.md) | 核心模块的程序化调用方式 |
| [故障排除](docs/troubleshooting.md) | 常见问题与解决方案 |
| [贡献指南](docs/contributing.md) | 开发环境、代码规范、如何贡献 |

## 测试

```bash
npm test          # 运行全部测试
npm run test:watch  # 监视模式
```

项目包含 204 个单元测试，覆盖渐变生成、文字排版、配色方案、颜色转换、XML 转义和可复现性。

## 灵感来源

本项目的渐变技术参照了设计师 Justin Jay Wang 在其文章 [Methods for Random Gradients](https://justinjay.wang/methods-for-random-gradients/) 中记录的 SVG 渐变方法论。我们分析了其公开的 SVG 源码，提取了核心算法（多层 radialGradient + transform 变换链），并在此基础上增强了颜色科学（OKLCH 插值）和可配置性。

## 许可证

[MIT](LICENSE) © 2026 Zeng Zixuan
