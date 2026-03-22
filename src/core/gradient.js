// @ts-check
import { pickRandom, randomRange } from './utils.js';
import { midpointColor } from './color-utils.js';

/**
 * @typedef {Object} GradientConfig
 * @property {string[]} colors - Palette colors (hex)
 * @property {() => number} rng - Seeded RNG
 * @property {number} [layers=12] - Number of gradient layers
 * @property {number} [size=800] - Canvas size
 */

/**
 * Select N primary colors from the palette for gradient definitions.
 * Uses 4 colors like OpenAI's implementation, picks distinct ones.
 * @param {string[]} colors
 * @param {() => number} rng
 * @returns {string[]}
 */
function selectPrimaryColors(colors, rng) {
  const count = Math.min(4, colors.length);
  const shuffled = [...colors].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate SVG <radialGradient> definitions.
 * Each gradient has a random focal point and 2-3 color stops.
 *
 * @param {string[]} paletteColors
 * @param {() => number} rng
 * @param {number} layerCount
 * @returns {{ defs: string, gradientIds: string[] }}
 */
export function generateGradientDefs(paletteColors, rng, layerCount) {
  const primaryColors = selectPrimaryColors(paletteColors, rng);
  const gradientIds = [];
  const gradients = [];

  for (let i = 0; i < primaryColors.length; i++) {
    const id = `rg${i}`;
    gradientIds.push(id);
    const color = primaryColors[i];
    const fx = randomRange(0.1, 0.45, rng).toFixed(4);

    // Some gradients get a 3-stop definition with an OKLCH midpoint
    const useThreeStops = rng() > 0.5 && primaryColors.length > 1;

    let stops;
    if (useThreeStops) {
      const otherColor = pickRandom(
        primaryColors.filter((c) => c !== color),
        rng
      );
      const mid = midpointColor(color, otherColor);
      stops = [
        `<stop offset="0%" stop-color="${color}"/>`,
        `<stop offset="50%" stop-color="${mid}" stop-opacity="0.6"/>`,
        `<stop offset="100%" stop-color="${color}" stop-opacity="0"/>`,
      ].join('');
    } else {
      stops = [
        `<stop offset="0%" stop-color="${color}"/>`,
        `<stop offset="100%" stop-color="${color}" stop-opacity="0"/>`,
      ].join('');
    }

    gradients.push(
      `<radialGradient id="${id}" fx="${fx}" fy="0.5">${stops}</radialGradient>`
    );
  }

  return {
    defs: gradients.join('\n    '),
    gradientIds,
  };
}

/**
 * Generate CSS style block for gradient layers.
 * @param {string} background - Base background color
 * @param {string[]} gradientIds
 * @returns {string}
 */
export function generateGradientStyles(background, gradientIds) {
  const rules = [`#bg{fill:${background}}`];
  gradientIds.forEach((id, i) => {
    rules.push(`.r${i}{fill:url(#${id})}`);
  });
  return `<style>${rules.join('')}</style>`;
}

/**
 * Generate the transform chain for a single gradient layer.
 * Follows OpenAI's pattern: translate(center) scale() skewX() rotate() translate(offset) translate(-center)
 *
 * @param {() => number} rng
 * @param {number} size
 * @returns {string}
 */
function generateTransform(rng, size) {
  const center = size / 2;
  const sx = randomRange(0.7, 1.5, rng).toFixed(4);
  const sy = randomRange(0.6, 1.5, rng).toFixed(4);
  const skew = randomRange(-10, 10, rng).toFixed(4);
  const rotation = randomRange(0, 360, rng).toFixed(2);
  const tx = randomRange(-center * 0.85, center * 0.85, rng).toFixed(2);
  const ty = randomRange(-center * 0.85, center * 0.85, rng).toFixed(2);

  return [
    `translate(${center} ${center})`,
    `scale(${sx} ${sy})`,
    `skewX(${skew})`,
    `rotate(${rotation})`,
    `translate(${tx} ${ty})`,
    `translate(${-center} ${-center})`,
  ].join(' ');
}

/**
 * Generate SVG <rect> elements for gradient layers.
 * Each layer references a gradient and gets a unique transform.
 *
 * @param {string[]} gradientIds
 * @param {() => number} rng
 * @param {number} layerCount
 * @param {number} size
 * @returns {string}
 */
export function generateGradientLayers(gradientIds, rng, layerCount, size) {
  const rects = [];

  for (let i = 0; i < layerCount; i++) {
    const gradIndex = i % gradientIds.length;
    const transform = generateTransform(rng, size);

    // Outer layers more transparent, inner layers more opaque
    const progress = i / layerCount;
    const opacity = randomRange(0.4 + progress * 0.3, 0.7 + progress * 0.3, rng).toFixed(2);

    rects.push(
      `<rect class="r${gradIndex}" x="0" y="0" width="100%" height="100%" opacity="${opacity}" transform="${transform}"/>`
    );
  }

  return rects.join('\n  ');
}
