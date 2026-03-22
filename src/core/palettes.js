// @ts-check

/**
 * @typedef {Object} Palette
 * @property {string} name
 * @property {string} label - Chinese display name
 * @property {string[]} colors - Array of hex colors (4-7 per palette)
 * @property {string} background - Base background color
 */

/** @type {Record<string, Palette>} */
const PALETTES = {
  warm: {
    name: 'warm',
    label: '温暖活力',
    colors: ['#FF6B6B', '#FF8E53', '#FFA07A', '#FFB347', '#FF69B4'],
    background: '#E8543E',
  },
  cool: {
    name: 'cool',
    label: '冷静科技',
    colors: ['#4ECDC4', '#45B7D1', '#5B86E5', '#36D1DC', '#6C63FF'],
    background: '#2B5876',
  },
  sunset: {
    name: 'sunset',
    label: '落日热情',
    colors: ['#FF5F6D', '#FF9966', '#FFC371', '#FC5C7D', '#B24592'],
    background: '#7B2D8E',
  },
  forest: {
    name: 'forest',
    label: '自然生态',
    colors: ['#2E8B57', '#6B8E23', '#3CB371', '#8FBC8F', '#BDB76B'],
    background: '#1A3C34',
  },
  ocean: {
    name: 'ocean',
    label: '深邃专业',
    colors: ['#0077B6', '#00B4D8', '#0096C7', '#90E0EF', '#CAF0F8'],
    background: '#0C2340',
  },
  creative: {
    name: 'creative',
    label: '创意多彩',
    colors: ['#A833C1', '#FF0080', '#00FFFF', '#CCFF00', '#8338EC'],
    background: '#1A0A2E',
  },
  tech: {
    name: 'tech',
    label: '科技未来',
    colors: ['#00D4FF', '#7B68EE', '#9D4EDD', '#4CC9F0', '#E0E0E0'],
    background: '#0D1117',
  },
  elegant: {
    name: 'elegant',
    label: '优雅商务',
    colors: ['#D4AF37', '#8B0000', '#C9B037', '#FFFFF0', '#722F37'],
    background: '#1A1A1A',
  },
  peach: {
    name: 'peach',
    label: '桃粉柔和',
    colors: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FAE1DD'],
    background: '#FFF5F0',
  },
  mint: {
    name: 'mint',
    label: '薄荷清新',
    colors: ['#B5EAD7', '#C7F0DB', '#E2F0CB', '#FFDAC1', '#95E1D3'],
    background: '#F0FFF5',
  },
  aurora: {
    name: 'aurora',
    label: '极光梦幻',
    colors: ['#C3B1E1', '#A2D2FF', '#FFAFCC', '#BDE0FE', '#CDB4DB'],
    background: '#F5F0FF',
  },
  blush: {
    name: 'blush',
    label: '腮红暖粉',
    colors: ['#FFCDB2', '#FFB4A2', '#E5989B', '#F4ACB7', '#FFCAD4'],
    background: '#FFF0F0',
  },
};

/**
 * Get a palette by name.
 * @param {string} name
 * @returns {Palette|undefined}
 */
export function getPalette(name) {
  return PALETTES[name];
}

/**
 * Get all palette names.
 * @returns {string[]}
 */
export function getAllPaletteNames() {
  return Object.keys(PALETTES);
}

/**
 * Get all palettes as an array.
 * @returns {Palette[]}
 */
export function getAllPalettes() {
  return Object.values(PALETTES);
}

/**
 * Resolve a palette from a name string or custom color array.
 * @param {string|string[]} nameOrColors
 * @returns {Palette}
 */
export function resolvePalette(nameOrColors) {
  if (Array.isArray(nameOrColors)) {
    return {
      name: 'custom',
      label: '自定义',
      colors: nameOrColors,
      background: nameOrColors[0],
    };
  }
  const palette = PALETTES[nameOrColors];
  if (!palette) {
    const available = Object.keys(PALETTES).join(', ');
    throw new Error(
      `Unknown palette "${nameOrColors}". Available: ${available}`
    );
  }
  return palette;
}

/**
 * Map a color_hint keyword to a palette name.
 * @param {string} hint
 * @returns {string}
 */
export function hintToPaletteName(hint) {
  const map = {
    warm: 'warm',
    cool: 'cool',
    sunset: 'sunset',
    forest: 'forest',
    ocean: 'ocean',
    creative: 'creative',
    tech: 'tech',
    elegant: 'elegant',
    peach: 'peach',
    mint: 'mint',
    aurora: 'aurora',
    blush: 'blush',
    hot: 'warm',
    cold: 'cool',
    nature: 'forest',
    sea: 'ocean',
    art: 'creative',
    business: 'elegant',
    soft: 'peach',
    pastel: 'aurora',
    pink: 'blush',
    fresh: 'mint',
  };
  return map[hint.toLowerCase()] || 'warm';
}
