// @ts-check
import { escapeXml, randomRange } from './utils.js';
import { textToPath } from './text-outliner.js';

const DEFAULT_FONT_FAMILY =
  '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif';

// Default layout constants
const PILL_DEFAULTS = { borderRadius: 28, paddingX: 40, paddingY: 16 };
const VERTICAL_COL_SPACING_RATIO = 1.6;

/**
 * @typedef {Object} TextConfig
 * @property {number} [fontSize] - Override auto font size
 * @property {number} [fontWeight] - Font weight (400-700)
 * @property {number} [letterSpacing] - Letter spacing in px
 * @property {number} [lineHeight] - Line height multiplier (e.g. 1.4)
 * @property {string} [textColor] - Override text color
 * @property {string} [fontFamily] - CSS font-family string
 * @property {object} [font] - opentype.Font object for measurement/outline
 * @property {boolean} [outline] - Convert text to path outlines
 * @property {object} [pill] - Pill-specific config
 * @property {object} [overlay] - Overlay-specific config
 */

/**
 * Split text into lines, filtering trailing empty lines.
 * @param {string} name
 * @returns {string[]}
 */
export function splitLines(name) {
  const lines = name.split('\n');
  // Remove trailing empty lines
  while (lines.length > 1 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  return lines;
}

/**
 * Calculate auto font size based on character count.
 * For multiline text, uses the longest line's length.
 * @param {string} name
 * @returns {number}
 */
export function autoFontSize(name) {
  const lines = splitLines(name);
  const len = Math.max(...lines.map((l) => l.length));
  if (len <= 2) return 80;
  if (len <= 3) return 72;
  if (len <= 4) return 60;
  if (len <= 5) return 56;
  if (len <= 6) return 48;
  if (len <= 7) return 44;
  return Math.max(32, Math.floor(320 / len));
}

/**
 * Generate pill (capsule label) layout SVG elements.
 * Semi-transparent rounded rectangle with centered text.
 *
 * @param {string} name
 * @param {number} width
 * @param {TextConfig} [config={}]
 * @param {number} [height]
 * @returns {string}
 */
export function pillLayout(name, width, config = {}, height) {
  const h = height ?? width;
  const lines = splitLines(name);
  const fontSize = config.fontSize || autoFontSize(name);
  const fontFamily = config.fontFamily || DEFAULT_FONT_FAMILY;
  const fontWeight = config.fontWeight || 600;
  const letterSpacing = config.letterSpacing ?? 2;
  const lineHeightMul = config.lineHeight || 1.4;
  const bgColor = config.pill?.bgColor || 'rgba(255,255,255,0.88)';
  const textColor = config.textColor || config.pill?.textColor || '#333333';
  const borderRadius = config.pill?.borderRadius || PILL_DEFAULTS.borderRadius;
  const paddingX = config.pill?.paddingX || PILL_DEFAULTS.paddingX;
  const paddingY = config.pill?.paddingY || PILL_DEFAULTS.paddingY;

  // Measure longest line width
  const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '');
  let textWidth;
  if (config.font) {
    textWidth =
      config.font.getAdvanceWidth(longestLine, fontSize) + letterSpacing * (longestLine.length - 1);
  } else {
    textWidth = longestLine.length * fontSize * 1.1;
  }

  const lineHeight = fontSize * lineHeightMul;
  const textBlockHeight = fontSize + (lines.length - 1) * lineHeight;
  const pillWidth = textWidth + paddingX * 2;
  const pillHeight = textBlockHeight + paddingY * 2;
  const pillX = (width - pillWidth) / 2;
  const pillY = (h - pillHeight) / 2;
  const firstLineY = pillY + paddingY + fontSize * 0.85;

  let textContent;
  if (lines.length === 1) {
    textContent = escapeXml(lines[0]);
  } else {
    textContent = lines
      .map((line, i) => {
        if (i === 0) return `<tspan x="${width / 2}" dy="0">${escapeXml(line)}</tspan>`;
        return `<tspan x="${width / 2}" dy="${lineHeight}">${escapeXml(line)}</tspan>`;
      })
      .join('');
  }

  const rectSvg = `<rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="${borderRadius}" fill="${bgColor}"/>`;

  if (config.outline && config.font) {
    const pathElements = lines
      .map((line, i) => {
        const lineY = firstLineY + i * lineHeight;
        return textToPath(line, config.font, fontSize, width / 2, lineY, {
          textAnchor: 'middle',
          letterSpacing,
          fill: textColor,
        });
      })
      .join('\n  ');
    return `\n  ${rectSvg}\n  ${pathElements}`;
  }

  return `
  ${rectSvg}
  <text x="${width / 2}" y="${firstLineY}" text-anchor="middle" font-family='${fontFamily}' font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" letter-spacing="${letterSpacing}">${textContent}</text>`;
}

/**
 * Generate overlay (large text with shadow) layout SVG elements.
 *
 * @param {string} name
 * @param {number} width
 * @param {TextConfig} [config={}]
 * @param {number} [height]
 * @returns {string}
 */
export function overlayLayout(name, width, config = {}, height) {
  const h = height ?? width;
  const lines = splitLines(name);
  const fontSize = config.fontSize || autoFontSize(name) * 1.3;
  const fontFamily = config.fontFamily || DEFAULT_FONT_FAMILY;
  const fontWeight = config.fontWeight || 700;
  const letterSpacing = config.letterSpacing ?? 4;
  const lineHeightMul = config.lineHeight || 1.4;
  const textColor = config.textColor || config.overlay?.textColor || '#ffffff';
  const shadowColor = config.overlay?.shadowColor || 'rgba(0,0,0,0.3)';
  const shadowBlur = config.overlay?.shadowBlur || 8;

  const filterId = 'text-shadow';
  const lineHeight = fontSize * lineHeightMul;
  const textBlockHeight = fontSize + (lines.length - 1) * lineHeight;
  const firstLineY = h / 2 - textBlockHeight / 2 + fontSize * 0.85;

  let textContent;
  if (lines.length === 1) {
    textContent = escapeXml(lines[0]);
  } else {
    textContent = lines
      .map((line, i) => {
        if (i === 0) return `<tspan x="${width / 2}" dy="0">${escapeXml(line)}</tspan>`;
        return `<tspan x="${width / 2}" dy="${lineHeight}">${escapeXml(line)}</tspan>`;
      })
      .join('');
  }

  const filterDefs = `
  <defs>
    <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="${shadowBlur}" flood-color="${shadowColor}"/>
    </filter>
  </defs>`;

  if (config.outline && config.font) {
    const pathElements = lines
      .map((line, i) => {
        const lineY = firstLineY + i * lineHeight;
        return textToPath(line, config.font, fontSize, width / 2, lineY, {
          textAnchor: 'middle',
          letterSpacing,
          fill: textColor,
          filter: `url(#${filterId})`,
        });
      })
      .join('\n  ');
    return `${filterDefs}\n  ${pathElements}`;
  }

  return `${filterDefs}
  <text x="${width / 2}" y="${firstLineY}" text-anchor="middle" font-family='${fontFamily}' font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" filter="url(#${filterId})" letter-spacing="${letterSpacing}">${textContent}</text>`;
}

/**
 * Generate vertical text layout SVG elements.
 * Each character positioned manually for precise control.
 *
 * @param {string} name
 * @param {number} width
 * @param {TextConfig} [config={}]
 * @param {number} [height]
 * @returns {string}
 */
export function verticalLayout(name, width, config = {}, height) {
  const h = height ?? width;
  const lines = splitLines(name);
  const fontSize = config.fontSize || autoFontSize(name) * 0.9;
  const fontFamily = config.fontFamily || DEFAULT_FONT_FAMILY;
  const fontWeight = config.fontWeight || 600;
  const textColor = config.textColor || '#ffffff';
  const charLineHeight = fontSize * (config.lineHeight || 1.4);
  const colSpacing = fontSize * VERTICAL_COL_SPACING_RATIO;

  // Each line becomes a vertical column, laid out right-to-left (traditional CJK)
  const columns = lines.map((line) => [...line]);
  const numCols = columns.length;
  const longestCol = Math.max(...columns.map((c) => c.length));
  const totalHeight = longestCol * charLineHeight;
  const totalWidth = numCols > 1 ? (numCols - 1) * colSpacing : 0;
  const startY = (h - totalHeight) / 2 + fontSize;
  const startX = width / 2 + totalWidth / 2; // rightmost column starts here

  const filterDefs = `
  <defs>
    <filter id="v-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>`;

  if (config.outline && config.font) {
    const pathElements = [];
    columns.forEach((chars, colIdx) => {
      const x = startX - colIdx * colSpacing;
      chars.forEach((char, charIdx) => {
        const y = startY + charIdx * charLineHeight;
        pathElements.push(
          textToPath(char, config.font, fontSize, x, y, {
            textAnchor: 'middle',
            fill: textColor,
            filter: 'url(#v-shadow)',
          }),
        );
      });
    });
    return `${filterDefs}\n  ${pathElements.join('\n  ')}`;
  }

  const charElements = [];
  columns.forEach((chars, colIdx) => {
    const x = startX - colIdx * colSpacing;
    chars.forEach((char, charIdx) => {
      const y = startY + charIdx * charLineHeight;
      charElements.push(
        `<text x="${x}" y="${y}" text-anchor="middle" font-family='${fontFamily}' font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" filter="url(#v-shadow)">${escapeXml(char)}</text>`,
      );
    });
  });

  return `${filterDefs}\n  ${charElements.join('\n  ')}`;
}

/**
 * Generate artistic (scattered characters) layout SVG elements.
 * Uses a grid-based constraint system to prevent overlap.
 *
 * @param {string} name
 * @param {number} width
 * @param {TextConfig} [config={}]
 * @param {() => number} [rng]
 * @param {number} [height]
 * @returns {string}
 */
export function artisticLayout(name, width, config = {}, rng, height) {
  const h = height ?? width;
  // Strip newlines — artistic mode scatters all characters regardless of lines
  const flatName = name.replace(/\n/g, '');
  const chars = [...flatName];
  const len = chars.length;
  const baseFontSize = config.fontSize || autoFontSize(flatName);
  const fontFamily = config.fontFamily || DEFAULT_FONT_FAMILY;
  const fontWeight = config.fontWeight || 700;
  const textColor = config.textColor || '#ffffff';

  // Grid layout: determine rows and columns
  let cols, rows;
  if (len <= 2) {
    cols = 2;
    rows = 1;
  } else if (len <= 4) {
    cols = 2;
    rows = Math.ceil(len / 2);
  } else if (len <= 6) {
    cols = 3;
    rows = Math.ceil(len / 3);
  } else {
    cols = 3;
    rows = Math.ceil(len / 3);
  }

  const marginX = width * 0.15;
  const marginY = h * 0.15;
  const usableW = width - marginX * 2;
  const usableH = h - marginY * 2;
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const gridStartX = marginX;
  const gridStartY = marginY + (usableH - rows * cellH) / 2;

  // Use rng for randomization, or fallback to deterministic positions
  const rand = rng || (() => 0.5);

  const filterDefs = `
  <defs>
    <filter id="a-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>`;

  const charElements = chars
    .map((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const centerX = gridStartX + col * cellW + cellW / 2;
      const centerY = gridStartY + row * cellH + cellH / 2;

      const offsetX = randomRange(-cellW * 0.15, cellW * 0.15, rand);
      const offsetY = randomRange(-cellH * 0.1, cellH * 0.1, rand);

      const sizeVariation = randomRange(0.8, 1.25, rand);
      const fontSize = Math.round(baseFontSize * sizeVariation);

      const x = centerX + offsetX;
      const y = centerY + offsetY + fontSize * 0.35;
      const opacity = randomRange(0.85, 1, rand).toFixed(2);

      if (config.outline && config.font) {
        return textToPath(char, config.font, fontSize, x, y, {
          textAnchor: 'middle',
          fill: textColor,
          opacity,
          filter: 'url(#a-shadow)',
        });
      }

      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family='${fontFamily}' font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" opacity="${opacity}" filter="url(#a-shadow)">${escapeXml(char)}</text>`;
    })
    .join('\n  ');

  return `${filterDefs}\n  ${charElements}`;
}

/**
 * Route to the correct text layout function.
 * @param {string} style - 'pill' | 'overlay' | 'vertical' | 'artistic' | 'none'
 * @param {string} name
 * @param {number} width
 * @param {TextConfig} [config={}]
 * @param {() => number} [rng]
 * @param {number} [height]
 * @returns {string}
 */
export function layoutText(style, name, width, config = {}, rng, height) {
  switch (style) {
    case 'none':
      return '';
    case 'pill':
      return pillLayout(name, width, config, height);
    case 'overlay':
      return overlayLayout(name, width, config, height);
    case 'vertical':
      return verticalLayout(name, width, config, height);
    case 'artistic':
      return artisticLayout(name, width, config, rng, height);
    default:
      return pillLayout(name, width, config, height);
  }
}
