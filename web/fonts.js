/**
 * Font management per locale for radial-stack
 * Maps locales to font families and provides CSS font-family strings
 */

const FONT_MAP = {
  'zh-CN': {
    family: 'Alibaba PuHuiTi 3',
    fallback: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  'zh-HK': {
    family: 'Alibaba Sans HK',
    fallback: '"PingFang HK", "Microsoft JhengHei", sans-serif',
  },
  ko: { family: 'Alibaba Sans KR', fallback: '"Malgun Gothic", sans-serif' },
  ja: { family: 'Alibaba Sans JP', fallback: '"Hiragino Sans", "Yu Gothic", sans-serif' },
  en: { family: 'Alibaba PuHuiTi 3', fallback: 'system-ui, sans-serif' },
};

// WOFF2 file map for outline/measurement loading
const WOFF2_MAP = {
  'zh-CN': '/fonts/AlibabaPuHuiTi-3-75-SemiBold.woff2',
  'zh-HK': '/fonts/AlibabaSansHK-75.woff2',
  ko: '/fonts/AlibabaSansKR-Bold.woff2',
  ja: '/fonts/AlibabaSansJP-Bold.woff2',
  en: '/fonts/AlibabaPuHuiTi-3-75-SemiBold.woff2',
};

export function getFontFamily(locale) {
  const m = FONT_MAP[locale] || FONT_MAP['zh-CN'];
  return `"${m.family}", ${m.fallback}`;
}

export function getSvgFontFamily(locale) {
  // For SVG font-family attribute
  const m = FONT_MAP[locale] || FONT_MAP['zh-CN'];
  return `"${m.family}", ${m.fallback}`;
}

export function getWoff2Url(locale) {
  return WOFF2_MAP[locale] || WOFF2_MAP['zh-CN'];
}

export function applyFontForLocale(locale) {
  const family = getFontFamily(locale);
  document.documentElement.style.setProperty('--font-app', family);
}
