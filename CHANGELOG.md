# 变更日志

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-03-21

### 新增

- **核心渐变引擎**：基于 OpenAI SVG 多层径向渐变叠加技术
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
- **184 个单元测试**：覆盖核心功能和边界情况
