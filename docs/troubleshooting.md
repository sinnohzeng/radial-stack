# 故障排除

## PNG 中文字体问题

### 症状

导出 PNG 时中文字符显示为方框或空白，CLI 提示：

```
⚠ 未找到中文字体文件。PNG 中的中文可能无法正确渲染。
```

### 原因

PNG 导出使用 `@resvg/resvg-js` 进行 SVG 光栅化，该库需要本地字体文件来渲染文字。SVG 中的中文字体需要系统安装对应的 CJK 字体。

### 解决方案

#### macOS

macOS 通常自带 PingFang 字体，程序会自动检测以下路径：

```
/System/Library/Fonts/PingFang.ttc
/System/Library/Fonts/STHeiti Light.ttc
/System/Library/Fonts/Hiragino Sans GB.ttc
```

如果这些路径都不存在（极少发生），可手动指定：

```bash
node generate.js --name "技术部" --png --font-path /path/to/your/font.ttf
```

#### Linux

需要安装 Noto CJK 字体包。根据发行版：

```bash
# Ubuntu / Debian
sudo apt install fonts-noto-cjk

# Fedora
sudo dnf install google-noto-sans-cjk-fonts

# Arch Linux
sudo pacman -S noto-fonts-cjk
```

程序会自动检测以下路径（见 `src/cli/png-export.js` 中的 `CJK_FONT_PATHS`）：

```
/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc
/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc
/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc
/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc
```

#### 手动指定字体路径

如果自动检测失败，使用 `--font-path` 参数：

```bash
node generate.js --name "技术部" --png --font-path /usr/share/fonts/custom/MyFont.ttf
```

> **注意**：SVG 文件本身不受字体问题影响。SVG 中通过 `font-family` 指定了多个回退字体（PingFang SC、Microsoft YaHei、Noto Sans SC 等），浏览器会自动选择可用字体。

---

## Web 预览无法加载

### 症状

直接打开 `web/index.html` 时页面空白，浏览器控制台报错：

```
Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy
```

或：

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of ""
```

### 原因

项目使用 ES Module（`import`/`export`），浏览器出于安全策略不允许通过 `file://` 协议加载模块脚本。

### 解决方案

必须通过 HTTP 服务器访问。使用项目内置的预览命令：

```bash
npm run preview
# 然后打开 http://localhost:3000/web/index.html
```

或使用任意 HTTP 服务器：

```bash
# Python
python3 -m http.server 3000

# Node.js (npx)
npx serve .

# 然后访问 http://localhost:3000/web/index.html
```

---

## 常见错误信息及解决方案

### `Unknown palette "xxx". Available: warm, cool, ...`

**原因**：指定了不存在的配色方案名称。

**解决**：使用 `src/core/palettes.js` 中定义的 8 个内置方案之一：`warm`、`cool`、`sunset`、`forest`、`ocean`、`creative`、`tech`、`elegant`。

---

### `--layers 应在 1-30 之间`

**原因**：渐变层数超出有效范围。

**解决**：使用 1-30 之间的整数。推荐值 8-16，层数越多效果越丰富但 SVG 体积越大。

---

### `--blur 应在 0-50 之间`

**原因**：模糊值超出有效范围。

**解决**：使用 0-50 之间的数值。0 为禁用模糊，推荐值 2-8。

---

### `请指定 --input 文件或 --name 部门名称`

**原因**：未提供任何输入。

**解决**：使用 `--name` 指定单个名称，或 `--input` 指定批量输入文件：

```bash
node generate.js --name "技术部"
node generate.js --input departments.json
```

---

### `输入文件不存在: /path/to/file`

**原因**：`--input` 指定的文件路径不正确。

**解决**：检查文件路径是否正确，支持的输入格式为 JSON、CSV、TXT。

---

### `配置文件不存在: /path/to/config`

**原因**：`--config` 指定的配置文件路径不正确。

**解决**：检查配置文件路径，确保文件存在且为有效 JSON 格式。

---

## 平台兼容性

| 平台 | SVG 生成 | PNG 导出 | Web 预览 | 备注 |
|------|----------|----------|----------|------|
| macOS | 支持 | 支持 | 支持 | PingFang 字体通常自带 |
| Linux | 支持 | 支持 | 支持 | 需安装 Noto CJK 字体 |
| Windows | 支持 | 支持 | 支持 | 需确认 Microsoft YaHei 字体可用 |

### 运行环境要求

- **Node.js**：18 或更高版本（ESM 支持）
- **npm**：随 Node.js 一起安装
- **浏览器**：支持 ES Module 的现代浏览器（Chrome 61+、Firefox 60+、Safari 11+）

### 已知限制

- PNG 导出依赖 `@resvg/resvg-js`，该库包含原生二进制文件，安装时需要编译环境或预编译二进制支持
- Windows 上的字体自动检测路径尚未在 `CJK_FONT_PATHS` 中配置，需要通过 `--font-path` 手动指定
- 噪声纹理（`feTurbulence`）在高分辨率下可能影响渲染性能

> 字体检测逻辑的源码位于 `src/cli/png-export.js`。如需扩展平台支持，可向 `CJK_FONT_PATHS` 对象添加新的路径。
