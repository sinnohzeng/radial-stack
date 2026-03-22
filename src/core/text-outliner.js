// @ts-check

/**
 * Convert text to SVG <path> data using opentype.js font object.
 *
 * @param {string} text - Text to convert
 * @param {object} font - opentype.Font object
 * @param {number} fontSize
 * @param {number} x - Start x coordinate
 * @param {number} y - Baseline y coordinate
 * @param {object} [options]
 * @param {string} [options.textAnchor] - 'start' | 'middle' | 'end'
 * @param {number} [options.letterSpacing] - Additional spacing between characters in px
 * @param {string} [options.fill] - Fill color
 * @param {string} [options.opacity] - Opacity value
 * @param {string} [options.filter] - SVG filter reference
 * @returns {string} SVG <path> or <g> element string
 */
export function textToPath(text, font, fontSize, x, y, options = {}) {
  const {
    textAnchor = 'start',
    letterSpacing = 0,
    fill = 'currentColor',
    opacity,
    filter,
  } = options;

  // Calculate total text width for anchor adjustment
  let totalWidth = font.getAdvanceWidth(text, fontSize);
  if (letterSpacing > 0 && text.length > 1) {
    totalWidth += letterSpacing * (text.length - 1);
  }

  // Adjust x based on text-anchor
  let startX = x;
  if (textAnchor === 'middle') {
    startX = x - totalWidth / 2;
  } else if (textAnchor === 'end') {
    startX = x - totalWidth;
  }

  let pathData;
  if (letterSpacing > 0) {
    // Render character by character with manual spacing
    const commands = [];
    let currentX = startX;
    for (const char of text) {
      const charPath = font.getPath(char, currentX, y, fontSize);
      const d = charPath.toPathData({ flipY: false, decimalPlaces: 2 });
      if (d && d !== 'M0 0Z') {
        commands.push(d);
      }
      currentX += font.getAdvanceWidth(char, fontSize) + letterSpacing;
    }
    pathData = commands.join(' ');
  } else {
    // Render whole string at once (kerning-aware)
    const path = font.getPath(text, startX, y, fontSize);
    pathData = path.toPathData({ flipY: false, decimalPlaces: 2 });
  }

  // Build attributes
  const attrs = [`d="${pathData}"`, `fill="${fill}"`];
  if (opacity) attrs.push(`opacity="${opacity}"`);
  if (filter) attrs.push(`filter="${filter}"`);

  return `<path ${attrs.join(' ')}/>`;
}
