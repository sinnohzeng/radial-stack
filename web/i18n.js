/**
 * Lightweight i18n module for radial-stack
 * Supports: zh-CN, zh-HK, ko, ja, en
 * Locale dictionaries are loaded from ./i18n/*.json
 */

const STORAGE_KEY = 'radial-stack-locale';

const AVAILABLE_LOCALES = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-HK', label: '繁體中文' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
];

const LOCALE_CODES = new Set(AVAILABLE_LOCALES.map((l) => l.code));

// Eagerly import all locale JSON (Vite resolves these at build time)
const loaders = {
  'zh-CN': () => import('./i18n/zh-CN.json'),
  'zh-HK': () => import('./i18n/zh-HK.json'),
  ko: () => import('./i18n/ko.json'),
  ja: () => import('./i18n/ja.json'),
  en: () => import('./i18n/en.json'),
};

const messages = {};

async function loadLocale(locale) {
  if (messages[locale]) return;
  const mod = await loaders[locale]?.();
  if (mod) messages[locale] = mod.default || mod;
}

let currentLocale = detectLocale();

// Pre-load current locale + en fallback
await Promise.all([loadLocale(currentLocale), loadLocale('en')]);

function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && LOCALE_CODES.has(saved)) return saved;

  const nav = navigator.language || navigator.languages?.[0] || 'en';
  if (LOCALE_CODES.has(nav)) return nav;
  const base = nav.split('-')[0];
  for (const code of LOCALE_CODES) {
    if (code === base || code.startsWith(base + '-')) return code;
  }
  return 'en';
}

/**
 * Get translated string for a key
 */
export function t(key) {
  const dict = messages[currentLocale] || messages['en'] || {};
  return dict[key] ?? messages['en']?.[key] ?? key;
}

/**
 * Switch locale
 */
export async function setLocale(lang) {
  if (!LOCALE_CODES.has(lang)) return;
  await loadLocale(lang);
  currentLocale = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: lang } }));
}

/**
 * Get current locale code
 */
export function getLocale() {
  return currentLocale;
}

/**
 * Get list of available locales
 */
export function getAvailableLocales() {
  return AVAILABLE_LOCALES;
}

/**
 * Apply translations to DOM elements with data-i18n attributes
 */
export function applyTranslations() {
  // data-i18n -> textContent
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  // data-i18n-placeholder -> placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key);
  });
  // data-i18n-title -> title attribute
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.title = t(key);
  });
  // data-i18n-label -> label attribute (for optgroup)
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-label');
    if (key) el.label = t(key);
  });
  // data-i18n-aria-label -> aria-label attribute
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', t(key));
  });
}
