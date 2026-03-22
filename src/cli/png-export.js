// @ts-check
import { Resvg } from '@resvg/resvg-js';
import { existsSync } from 'fs';
import { platform } from 'os';

/**
 * Known system font paths for CJK fonts.
 */
const CJK_FONT_PATHS = {
  darwin: [
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/STHeiti Light.ttc',
    '/System/Library/Fonts/Hiragino Sans GB.ttc',
  ],
  linux: [
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
  ],
};

/**
 * Find the first available CJK font path on the system.
 * @returns {string|null}
 */
function findCjkFont() {
  const os = platform();
  const paths = CJK_FONT_PATHS[os] || [];
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Convert an SVG string to a PNG buffer.
 *
 * @param {string} svgString
 * @param {Object} [options={}]
 * @param {number} [options.width=1024]
 * @param {number} [options.height=1024]
 * @param {string} [options.fontPath] - Custom font file path
 * @returns {{ buffer: Buffer, warnings: string[] }}
 */
export function svgToPng(svgString, options = {}) {
  const { width = 1024, height = 1024, fontPath } = options;
  const warnings = [];

  const resvgOpts = {
    fitTo: { mode: /** @type {const} */ ('width'), value: width },
    font: {
      fontFiles: /** @type {string[]} */ ([]),
      loadSystemFonts: true,
    },
  };

  // Try to add CJK font
  const cjkPath = fontPath || findCjkFont();
  if (cjkPath) {
    resvgOpts.font.fontFiles = [cjkPath];
  } else {
    warnings.push(
      '⚠ 未找到中文字体文件。PNG 中的中文可能无法正确渲染。\n' +
      '  macOS: 应该自带 PingFang\n' +
      '  Linux: 请安装 fonts-noto-cjk\n' +
      '  或使用 --font-path 指定字体文件路径'
    );
  }

  const resvg = new Resvg(svgString, resvgOpts);
  const pngData = resvg.render();
  const buffer = pngData.asPng();

  return { buffer, warnings };
}
