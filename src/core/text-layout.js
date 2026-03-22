// @ts-check
import { escapeXml, randomRange } from './utils.js';

const FONT_FAMILY = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif';

/**
 * @typedef {Object} TextConfig
 * @property {number} [fontSize] - Override auto font size
 * @property {object} [pill] - Pill-specific config
 * @property {object} [overlay] - Overlay-specific config
 */

/**
 * Calculate auto font size based on character count.
 * @param {string} name
 * @returns {number}
 */
export function autoFontSize(name) {
  const len = name.length;
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
 * @param {number} size
 * @param {TextConfig} [config={}]
 * @returns {string}
 */
export function pillLayout(name, size, config = {}) {
  const escaped = escapeXml(name);
  const fontSize = config.fontSize || autoFontSize(name);
  const bgColor = config.pill?.bgColor || 'rgba(255,255,255,0.88)';
  const textColor = config.pill?.textColor || '#333333';
  const borderRadius = config.pill?.borderRadius || 28;
  const paddingX = config.pill?.paddingX || 40;
  const paddingY = config.pill?.paddingY || 16;

  const charWidth = fontSize * 1.1;
  const pillWidth = name.length * charWidth + paddingX * 2;
  const pillHeight = fontSize + paddingY * 2;
  const pillX = (size - pillWidth) / 2;
  const pillY = (size - pillHeight) / 2;
  const textY = pillY + pillHeight / 2 + fontSize * 0.35;

  return `
  <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="${borderRadius}" fill="${bgColor}"/>
  <text x="${size / 2}" y="${textY}" text-anchor="middle" font-family='${FONT_FAMILY}' font-size="${fontSize}" font-weight="600" fill="${textColor}" letter-spacing="2">${escaped}</text>`;
}

/**
 * Generate overlay (large text with shadow) layout SVG elements.
 *
 * @param {string} name
 * @param {number} size
 * @param {TextConfig} [config={}]
 * @returns {string}
 */
export function overlayLayout(name, size, config = {}) {
  const escaped = escapeXml(name);
  const fontSize = config.fontSize || autoFontSize(name) * 1.3;
  const textColor = config.overlay?.textColor || '#ffffff';
  const shadowColor = config.overlay?.shadowColor || 'rgba(0,0,0,0.3)';
  const shadowBlur = config.overlay?.shadowBlur || 8;

  const filterId = 'text-shadow';
  const textY = size / 2 + fontSize * 0.35;

  return `
  <defs>
    <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="${shadowBlur}" flood-color="${shadowColor}"/>
    </filter>
  </defs>
  <text x="${size / 2}" y="${textY}" text-anchor="middle" font-family='${FONT_FAMILY}' font-size="${fontSize}" font-weight="700" fill="${textColor}" filter="url(#${filterId})" letter-spacing="4">${escaped}</text>`;
}

/**
 * Generate vertical text layout SVG elements.
 * Each character positioned manually for precise control.
 *
 * @param {string} name
 * @param {number} size
 * @param {TextConfig} [config={}]
 * @returns {string}
 */
export function verticalLayout(name, size, config = {}) {
  const fontSize = config.fontSize || autoFontSize(name) * 0.9;
  const chars = [...name];
  const lineHeight = fontSize * 1.4;
  const totalHeight = chars.length * lineHeight;
  const startY = (size - totalHeight) / 2 + fontSize;
  const x = size / 2;

  const charElements = chars.map((char, i) => {
    const y = startY + i * lineHeight;
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family='${FONT_FAMILY}' font-size="${fontSize}" font-weight="600" fill="#ffffff" filter="url(#v-shadow)">${escapeXml(char)}</text>`;
  }).join('\n  ');

  return `
  <defs>
    <filter id="v-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  ${charElements}`;
}

/**
 * Generate artistic (scattered characters) layout SVG elements.
 * Uses a grid-based constraint system to prevent overlap.
 *
 * @param {string} name
 * @param {number} size
 * @param {TextConfig} [config={}]
 * @param {() => number} [rng]
 * @returns {string}
 */
export function artisticLayout(name, size, config = {}, rng) {
  const chars = [...name];
  const len = chars.length;
  const baseFontSize = config.fontSize || autoFontSize(name);

  // Grid layout: determine rows and columns
  let cols, rows;
  if (len <= 2) { cols = 2; rows = 1; }
  else if (len <= 4) { cols = 2; rows = Math.ceil(len / 2); }
  else if (len <= 6) { cols = 3; rows = Math.ceil(len / 3); }
  else { cols = 3; rows = Math.ceil(len / 3); }

  const margin = size * 0.15;
  const usable = size - margin * 2;
  const cellW = usable / cols;
  const cellH = usable / rows;
  const gridStartX = margin;
  const gridStartY = margin + (usable - rows * cellH) / 2;

  // Use rng for randomization, or fallback to deterministic positions
  const rand = rng || (() => 0.5);

  const charElements = chars.map((char, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const centerX = gridStartX + col * cellW + cellW / 2;
    const centerY = gridStartY + row * cellH + cellH / 2;

    // Random offset within cell (±20% of cell size)
    const offsetX = randomRange(-cellW * 0.15, cellW * 0.15, rand);
    const offsetY = randomRange(-cellH * 0.1, cellH * 0.1, rand);

    // Random font size variation (±25%)
    const sizeVariation = randomRange(0.8, 1.25, rand);
    const fontSize = Math.round(baseFontSize * sizeVariation);

    const x = centerX + offsetX;
    const y = centerY + offsetY + fontSize * 0.35;

    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family='${FONT_FAMILY}' font-size="${fontSize}" font-weight="700" fill="#ffffff" opacity="${randomRange(0.85, 1, rand).toFixed(2)}" filter="url(#a-shadow)">${escapeXml(char)}</text>`;
  }).join('\n  ');

  return `
  <defs>
    <filter id="a-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>
  ${charElements}`;
}

/**
 * Route to the correct text layout function.
 * @param {string} style - 'pill' | 'overlay' | 'vertical' | 'artistic'
 * @param {string} name
 * @param {number} size
 * @param {TextConfig} [config={}]
 * @param {() => number} [rng]
 * @returns {string}
 */
export function layoutText(style, name, size, config = {}, rng) {
  switch (style) {
    case 'pill': return pillLayout(name, size, config);
    case 'overlay': return overlayLayout(name, size, config);
    case 'vertical': return verticalLayout(name, size, config);
    case 'artistic': return artisticLayout(name, size, config, rng);
    default: return pillLayout(name, size, config);
  }
}
