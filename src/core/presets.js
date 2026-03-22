// @ts-check

/**
 * @typedef {Object} ScenePreset
 * @property {string} name - Preset identifier
 * @property {string} label - Chinese display name
 * @property {string} category - Category for grouping
 * @property {number} width - SVG viewBox width
 * @property {number} height - SVG viewBox height
 * @property {number} pngWidth - Recommended PNG export width
 * @property {number} pngHeight - Recommended PNG export height
 * @property {string} description - Usage description
 */

/**
 * @typedef {Object} ResolutionPreset
 * @property {string} name - Preset identifier
 * @property {string} label - Display name
 * @property {number} scale - Multiplier applied to the SVG viewBox dimensions
 */

/** @type {Record<string, ResolutionPreset>} */
const RESOLUTIONS = {
  standard: { name: 'standard', label: '标准 1K', scale: 1 },
  hd: { name: 'hd', label: '高清 HD', scale: 2 },
  '2k': { name: '2k', label: '2K', scale: 3 },
  '4k': { name: '4k', label: '4K UHD', scale: 4 },
  '8k': { name: '8k', label: '8K', scale: 8 },
};

/** @type {Record<string, ScenePreset>} */
const SCENE_PRESETS = {
  // --- 通用 ---
  square: {
    name: 'square',
    label: '正方形',
    category: '通用',
    width: 800,
    height: 800,
    pngWidth: 1024,
    pngHeight: 1024,
    description: '头像、图标、社交卡片',
  },
  'banner-wide': {
    name: 'banner-wide',
    label: '宽幅横幅',
    category: '通用',
    width: 1600,
    height: 900,
    pngWidth: 1920,
    pngHeight: 1080,
    description: '网站 Hero Banner (16:9)',
  },
  'banner-ultra': {
    name: 'banner-ultra',
    label: '超宽横幅',
    category: '通用',
    width: 2100,
    height: 900,
    pngWidth: 2520,
    pngHeight: 1080,
    description: '超宽 Banner (21:9)',
  },

  // --- 社交媒体 ---
  'wechat-cover': {
    name: 'wechat-cover',
    label: '公众号封面',
    category: '社交媒体',
    width: 900,
    height: 383,
    pngWidth: 900,
    pngHeight: 383,
    description: '微信公众号头图 (2.35:1)',
  },
  'wechat-article': {
    name: 'wechat-article',
    label: '文章配图',
    category: '社交媒体',
    width: 900,
    height: 500,
    pngWidth: 900,
    pngHeight: 500,
    description: '公众号文章内嵌图片',
  },
  xiaohongshu: {
    name: 'xiaohongshu',
    label: '小红书',
    category: '社交媒体',
    width: 600,
    height: 800,
    pngWidth: 1080,
    pngHeight: 1440,
    description: '小红书竖版 (3:4)',
  },
  douyin: {
    name: 'douyin',
    label: '抖音封面',
    category: '社交媒体',
    width: 450,
    height: 800,
    pngWidth: 1080,
    pngHeight: 1920,
    description: '抖音/短视频封面 (9:16)',
  },

  // --- 电商 ---
  'taobao-main': {
    name: 'taobao-main',
    label: '淘宝主图',
    category: '电商',
    width: 800,
    height: 800,
    pngWidth: 800,
    pngHeight: 800,
    description: '淘宝商品主图 (1:1)',
  },
  'taobao-banner': {
    name: 'taobao-banner',
    label: '店铺横幅',
    category: '电商',
    width: 1920,
    height: 600,
    pngWidth: 1920,
    pngHeight: 600,
    description: '淘宝店铺 Banner',
  },
  'jd-sku': {
    name: 'jd-sku',
    label: '京东主图',
    category: '电商',
    width: 800,
    height: 800,
    pngWidth: 800,
    pngHeight: 800,
    description: '京东商品主图 (1:1)',
  },

  // --- 设计/办公 ---
  'poster-a4': {
    name: 'poster-a4',
    label: 'A4 海报',
    category: '设计',
    width: 595,
    height: 842,
    pngWidth: 2480,
    pngHeight: 3508,
    description: 'A4 纵向海报 (300dpi)',
  },
  'poster-horizontal': {
    name: 'poster-horizontal',
    label: '横版海报',
    category: '设计',
    width: 1200,
    height: 800,
    pngWidth: 1800,
    pngHeight: 1200,
    description: '横版海报 (3:2)',
  },
  'ppt-slide': {
    name: 'ppt-slide',
    label: 'PPT 背景',
    category: '设计',
    width: 1600,
    height: 900,
    pngWidth: 1920,
    pngHeight: 1080,
    description: 'PPT/Keynote 幻灯片 (16:9)',
  },

  // --- 壁纸 ---
  'desktop-wallpaper': {
    name: 'desktop-wallpaper',
    label: '桌面壁纸',
    category: '壁纸',
    width: 1600,
    height: 1000,
    pngWidth: 2560,
    pngHeight: 1600,
    description: '桌面壁纸 (16:10)',
  },
  'mobile-wallpaper': {
    name: 'mobile-wallpaper',
    label: '手机壁纸',
    category: '壁纸',
    width: 410,
    height: 890,
    pngWidth: 1170,
    pngHeight: 2532,
    description: '手机壁纸 (iPhone)',
  },
};

/**
 * Get a scene preset by name.
 * @param {string} name
 * @returns {ScenePreset|undefined}
 */
export function getScenePreset(name) {
  return SCENE_PRESETS[name];
}

/**
 * Get all scene presets.
 * @returns {ScenePreset[]}
 */
export function getAllScenePresets() {
  return Object.values(SCENE_PRESETS);
}

/**
 * Get all scene preset names.
 * @returns {string[]}
 */
export function getAllScenePresetNames() {
  return Object.keys(SCENE_PRESETS);
}

/**
 * Get scene presets grouped by category.
 * @returns {Record<string, ScenePreset[]>}
 */
export function getScenePresetsByCategory() {
  /** @type {Record<string, ScenePreset[]>} */
  const grouped = {};
  for (const preset of Object.values(SCENE_PRESETS)) {
    if (!grouped[preset.category]) grouped[preset.category] = [];
    grouped[preset.category].push(preset);
  }
  return grouped;
}

/**
 * Get a resolution preset by name.
 * @param {string} name
 * @returns {ResolutionPreset|undefined}
 */
export function getResolutionPreset(name) {
  return RESOLUTIONS[name];
}

/**
 * Get all resolution presets.
 * @returns {ResolutionPreset[]}
 */
export function getAllResolutionPresets() {
  return Object.values(RESOLUTIONS);
}

/**
 * Get all resolution preset names.
 * @returns {string[]}
 */
export function getAllResolutionPresetNames() {
  return Object.keys(RESOLUTIONS);
}

/**
 * Compute the final PNG export dimensions by combining a scene preset
 * with a resolution preset.
 *
 * If resolution is provided, the PNG size is calculated as
 * (viewBox dimensions * resolution scale). Otherwise, the scene
 * preset's default pngWidth/pngHeight are used.
 *
 * @param {ScenePreset} scene
 * @param {ResolutionPreset} [resolution]
 * @returns {{ pngWidth: number, pngHeight: number }}
 */
export function computeExportSize(scene, resolution) {
  if (resolution) {
    return {
      pngWidth: scene.width * resolution.scale,
      pngHeight: scene.height * resolution.scale,
    };
  }
  return {
    pngWidth: scene.pngWidth,
    pngHeight: scene.pngHeight,
  };
}

/**
 * Format a human-readable preset listing for CLI --list-presets.
 * @returns {string}
 */
export function formatPresetListing() {
  const lines = [];

  lines.push('场景预设 (--preset)：');
  lines.push('');
  const grouped = getScenePresetsByCategory();
  for (const [category, presets] of Object.entries(grouped)) {
    lines.push(`  【${category}】`);
    for (const p of presets) {
      const ratio = `${p.width}×${p.height}`;
      const png = `${p.pngWidth}×${p.pngHeight}`;
      lines.push(
        `    ${p.name.padEnd(22)} ${p.label.padEnd(10)} ${ratio.padEnd(12)} PNG ${png.padEnd(12)} ${p.description}`,
      );
    }
    lines.push('');
  }

  lines.push('分辨率预设 (--resolution)：');
  lines.push('');
  for (const r of Object.values(RESOLUTIONS)) {
    lines.push(`    ${r.name.padEnd(12)} ${r.label.padEnd(10)} ×${r.scale} 倍`);
  }

  return lines.join('\n');
}
