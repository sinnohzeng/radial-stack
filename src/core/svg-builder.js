// @ts-check
import { createRng, hashString } from './utils.js';
import { resolvePalette } from './palettes.js';
import {
  generateGradientDefs,
  generateGradientStyles,
  generateGradientLayers,
} from './gradient.js';
import { layoutText } from './text-layout.js';

/**
 * @typedef {Object} BuildOptions
 * @property {string} name - Department name
 * @property {number} [size=800] - Canvas size (square shorthand)
 * @property {number} [width] - Canvas width (overrides size)
 * @property {number} [height] - Canvas height (overrides size)
 * @property {string|string[]} [palette='warm'] - Palette name or custom color array
 * @property {string|number} [seed] - Random seed (defaults to name hash)
 * @property {number} [layers=12] - Number of gradient layers
 * @property {number} [blur=0] - Gaussian blur stdDeviation (0 = disabled)
 * @property {boolean} [noise=false] - Add noise texture
 * @property {number} [noiseFrequency=0.65] - Noise texture base frequency
 * @property {number} [saturation=130] - Saturation filter percentage
 * @property {string} [textStyle='pill'] - Text layout: pill | overlay | vertical | artistic
 * @property {number} [fontSize] - Override auto font size
 * @property {number} [fontWeight] - Font weight (400-700)
 * @property {number} [letterSpacing] - Letter spacing in px
 * @property {number} [lineHeight] - Line height multiplier
 * @property {string} [textColor] - Override text color
 * @property {string} [fontFamily] - CSS font-family string
 * @property {object} [font] - opentype.Font object for measurement/outline
 * @property {boolean} [outline] - Convert text to path outlines (export only)
 * @property {string} [blendMode] - CSS mix-blend-mode for gradient layers
 * @property {object} [decorations] - Decoration options
 * @property {boolean} [decorations.border=false]
 * @property {string} [decorations.borderColor='rgba(255,255,255,0.1)']
 * @property {number} [decorations.borderWidth=0.5]
 * @property {string} [decorations.cornerBadge] - Corner badge text (e.g. '01')
 * @property {string} [decorations.logo] - SVG path data for logo watermark
 * @property {object} [pill] - Pill-specific config
 * @property {object} [overlay] - Overlay-specific config
 */

/**
 * Build a complete SVG string for a gradient badge.
 *
 * @param {BuildOptions} options
 * @returns {string} Complete SVG string
 */
export function buildSVG(options) {
  const {
    name,
    size = 800,
    width: widthOpt,
    height: heightOpt,
    palette: paletteInput = 'warm',
    seed,
    layers = 12,
    blur = 3,
    noise = false,
    noiseFrequency = 0.65,
    saturation = 130,
    textStyle = 'pill',
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    textColor,
    fontFamily,
    font,
    outline,
    blendMode,
    decorations = {},
    pill,
    overlay,
  } = options;

  // Resolve dimensions: width/height override size
  const w = widthOpt ?? size;
  const h = heightOpt ?? size;

  // Resolve palette and create RNG
  const palette = resolvePalette(paletteInput);
  const rngSeed = seed ?? hashString(name);
  const rng = createRng(rngSeed);

  // Generate gradient definitions
  const { defs: gradientDefs, gradientIds } = generateGradientDefs(palette.colors, rng, layers);

  // Generate styles
  const styles = generateGradientStyles(palette.background, gradientIds);

  // Generate gradient rect layers
  const gradientLayers = generateGradientLayers(gradientIds, rng, layers, w, h);

  // Build filter definitions
  const filters = buildFilters(blur, noise, noiseFrequency);

  // Generate text layout
  const textConfig = {
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    textColor,
    fontFamily,
    font,
    outline,
    pill,
    overlay,
  };
  const textElements = layoutText(textStyle, name, w, textConfig, rng, h);

  // Generate decorations
  const decorationElements = buildDecorations(decorations, w, h);

  // Blend mode attribute for gradient group
  const blendAttr = blendMode ? ` style="mix-blend-mode:${blendMode}"` : '';

  // Assemble SVG
  const filterAttr = filters ? ' filter="url(#fx)"' : '';
  const svgStyle = `width:100%;height:auto;filter:saturate(${saturation}%)`;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="${svgStyle}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${styles}
    ${gradientDefs}
    ${filters}
  </defs>
  <rect id="bg" x="0" y="0" width="100%" height="100%"/>
  <g${blendAttr}${filterAttr}>
  ${gradientLayers}
  </g>
  ${textElements}
  ${decorationElements}
</svg>`;
}

/**
 * Build SVG filter definitions for blur and noise.
 * @param {number} blur
 * @param {boolean} noise
 * @returns {string}
 */
function buildFilters(blur, noise, noiseFrequency = 0.65) {
  if (!blur && !noise) return '';

  const filterParts = [];

  if (blur > 0) {
    filterParts.push(
      `<feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blurred"/>`,
    );
  }

  if (noise) {
    const numOctaves = noiseFrequency <= 0.65 ? 3 : noiseFrequency <= 1.0 ? 4 : 5;
    filterParts.push(
      `<feTurbulence type="fractalNoise" baseFrequency="${noiseFrequency}" numOctaves="${numOctaves}" result="noise"/>`,
      `<feBlend in="${blur ? 'blurred' : 'SourceGraphic'}" in2="noise" mode="soft-light"/>`,
    );
  }

  return `<filter id="fx" x="0" y="0" width="100%" height="100%">
      ${filterParts.join('\n      ')}
    </filter>`;
}

/**
 * Build optional SVG decoration elements.
 * @param {object} decorations
 * @param {number} width
 * @param {number} [height]
 * @returns {string}
 */
function buildDecorations(decorations, width, height) {
  const w = width;
  const h = height ?? width;
  const parts = [];

  // Border
  if (decorations.border) {
    const borderColor = decorations.borderColor || 'rgba(255,255,255,0.1)';
    const borderWidth = decorations.borderWidth || 0.5;
    parts.push(
      `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${w - borderWidth}" height="${h - borderWidth}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"/>`,
    );
  }

  // Corner badge
  if (decorations.cornerBadge) {
    parts.push(
      `<text x="${w - 30}" y="35" text-anchor="end" font-family="monospace" font-size="18" fill="rgba(255,255,255,0.5)">${decorations.cornerBadge}</text>`,
    );
  }

  // Logo watermark
  if (decorations.logo) {
    parts.push(
      `<g transform="translate(${w - 60}, ${h - 60}) scale(0.4)" opacity="0.3">
        <path d="${decorations.logo}" fill="white"/>
      </g>`,
    );
  }

  return parts.join('\n  ');
}
