import './style.css';
import { state, DEFAULT_FONT_FAMILY, BUILTIN_FONT_FAMILY } from './state.js';
import { downloadSVG, downloadPNG } from './export.js';
import { buildSVG } from '../src/core/svg-builder.js';
import { getAllPalettes } from '../src/core/palettes.js';
import { getScenePreset, getResolutionPreset } from '../src/core/presets.js';
import { t, setLocale, getLocale, getAvailableLocales, applyTranslations } from './i18n.js';
import { initTheme, toggleTheme, getTheme } from './theme.js';
import { getFontFamily, getSvgFontFamily, applyFontForLocale, getWoff2Url } from './fonts.js';
import pkg from '../package.json';

// --- Font management ---

async function loadOpentype() {
  const mod = await import('opentype.js');
  return mod.default || mod;
}

let wawoff2Cache = null;
async function loadWawoff2() {
  if (wawoff2Cache) return wawoff2Cache;
  // Load wawoff2 WASM module
  const init = new Promise((resolve) => { window.Module = { onRuntimeInitialized: resolve }; });
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/wawoff2@2.0.1/build/decompress_binding.js';
  document.head.appendChild(script);
  await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
  await init;
  wawoff2Cache = window.Module;
  return wawoff2Cache;
}

async function handleFontChange(value) {
  const statusEl = document.getElementById('fontStatus');
  const fileInput = document.getElementById('fontInput');
  statusEl.textContent = '';
  statusEl.className = 'font-status';

  if (value === 'builtin') {
    try {
      const opentype = await loadOpentype();
      const woff2Url = getWoff2Url(getLocale());
      const resp = await fetch(woff2Url);
      const buf = await resp.arrayBuffer();
      // WOFF2 needs decompression before opentype can parse
      let fontBuf = buf;
      try {
        const wawoff2Module = await loadWawoff2();
        fontBuf = wawoff2Module.decompress(buf);
      } catch (e) {
        console.warn('wawoff2 not available, trying direct parse:', e);
      }
      state.fontObj = opentype.parse(fontBuf);
      state.fontFamily = getSvgFontFamily(getLocale());
      statusEl.textContent = t('msg.font_loaded') + ' ' + t('font.builtin');
    } catch (e) {
      console.warn('Failed to load builtin font for measurement:', e);
      state.fontObj = null;
      state.fontFamily = getSvgFontFamily(getLocale());
    }
    updatePreview();
  } else if (value === 'system') {
    state.fontObj = null;
    state.fontFamily = DEFAULT_FONT_FAMILY;
    updatePreview();
  } else if (value === 'custom') {
    fileInput.click();
  }
}

async function handleFontUpload(file) {
  const statusEl = document.getElementById('fontStatus');
  const selectEl = document.getElementById('fontSelect');

  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'ttf' && ext !== 'otf') {
    statusEl.textContent = '请使用 TTF 或 OTF 格式的字体文件';
    statusEl.className = 'font-status error';
    selectEl.value = 'builtin';
    handleFontChange('builtin');
    return;
  }

  try {
    const opentype = await loadOpentype();
    const buf = await file.arrayBuffer();
    const font = opentype.parse(buf);
    state.fontObj = font;

    const fontName = font.names.fontFamily?.en || font.names.fontFamily?.zh || file.name;
    const fontUrl = URL.createObjectURL(new Blob([buf]));
    const style = document.createElement('style');
    style.textContent = `@font-face { font-family: '${fontName}'; src: url('${fontUrl}') format('${ext === 'otf' ? 'opentype' : 'truetype'}'); }`;
    document.head.appendChild(style);

    state.fontFamily = `'${fontName}', ${DEFAULT_FONT_FAMILY}`;
    statusEl.textContent = `已加载: ${fontName}`;
    statusEl.className = 'font-status';
    updatePreview();
  } catch (e) {
    statusEl.textContent = '字体文件解析失败，请检查文件是否完整';
    statusEl.className = 'font-status error';
    console.error('Font parse error:', e);
    selectEl.value = 'builtin';
    handleFontChange('builtin');
  }
}

// --- Preview ---

function updatePreview() {
  const name = document.getElementById('nameInput').value || '部门名称';
  const layers = parseInt(document.getElementById('layersSlider').value);
  const saturation = parseInt(document.getElementById('saturationSlider').value);
  const blur = parseInt(document.getElementById('blurSlider').value);
  const noise = state.noiseLevel !== 'off';
  const noiseFrequency = { off: 0, low: 0.35, medium: 0.65, high: 1.0 }[state.noiseLevel] || 0.65;
  const blendMode = document.getElementById('blendSelect').value || undefined;
  const seed = document.getElementById('seedInput').value || undefined;

  // Typography options (inlined from former getTypographyOptions)
  const fontSizeVal = parseInt(document.getElementById('fontSizeSlider').value);
  const fontSize = fontSizeVal > 0 ? fontSizeVal : undefined;
  const fontWeight = parseInt(document.getElementById('fontWeightSelect').value);
  const letterSpacing = parseInt(document.getElementById('letterSpacingSlider').value);
  const lineHeightRaw = parseInt(document.getElementById('lineHeightSlider').value);
  const lineHeight = lineHeightRaw / 10;
  const autoColor = document.getElementById('textColorAuto')?.checked ?? true;
  const textColor = autoColor ? undefined : document.getElementById('textColorInput').value;

  document.getElementById('fontSizeValue').textContent = fontSize ? fontSize + 'px' : '自动';
  document.getElementById('letterSpacingValue').textContent = letterSpacing;
  document.getElementById('lineHeightValue').textContent = lineHeight.toFixed(1);

  const preset = getScenePreset(state.preset);
  const w = preset ? preset.width : 800;
  const h = preset ? preset.height : 800;

  state.currentOptions = {
    name,
    width: w,
    height: h,
    palette: state.palette,
    textStyle: state.textStyle,
    fontFamily: state.fontFamily,
    font: state.fontObj,
    layers, saturation, blur, noise, noiseFrequency, blendMode, seed,
    fontSize, fontWeight, letterSpacing, lineHeight, textColor,
  };

  const svg = buildSVG(state.currentOptions);

  const frame = document.getElementById('previewFrame');
  frame.style.aspectRatio = w + ' / ' + h;

  while (frame.firstChild) frame.removeChild(frame.firstChild);

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const errMsg = document.createElement('p');
    errMsg.textContent = 'SVG 解析错误';
    errMsg.style.color = '#ff6b6b';
    frame.appendChild(errMsg);
    return;
  }
  const svgEl = doc.documentElement;
  svgEl.style.width = '100%';
  svgEl.style.height = '100%';
  frame.appendChild(document.adoptNode(svgEl));

  state.lastSVG = svg;
  state.lastName = name;
}

// --- Init ---

function init() {
  // Text input
  document.getElementById('nameInput').addEventListener('input', updatePreview);

  // Preset select — handled below with updateResolutionLabels

  // Resolution pills (event delegation)
  document.querySelectorAll('.res-pill').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.res-pill').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      state.resolution = el.dataset.res;
    });
  });

  // Palette grid — build DOM and bind via event delegation
  const palettes = getAllPalettes();
  const grid = document.getElementById('paletteGrid');
  palettes.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'palette-option' + (i === 0 ? ' active' : '');
    div.dataset.palette = p.name;

    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'palette-dots';
    p.colors.slice(0, 4).forEach(c => {
      const dot = document.createElement('span');
      dot.className = 'palette-dot';
      dot.style.background = c;
      dotsDiv.appendChild(dot);
    });

    const nameSpan = document.createElement('span');
    nameSpan.className = 'palette-name';
    nameSpan.dataset.i18nKey = 'palette.' + p.name;
    nameSpan.textContent = t('palette.' + p.name);

    div.appendChild(dotsDiv);
    div.appendChild(nameSpan);
    grid.appendChild(div);
  });

  grid.addEventListener('click', (e) => {
    const option = e.target.closest('.palette-option');
    if (!option) return;
    document.querySelectorAll('.palette-option').forEach(el => el.classList.remove('active'));
    option.classList.add('active');
    state.palette = option.dataset.palette;
    updatePreview();
  });

  // Text style grid (event delegation)
  document.querySelector('.style-grid').addEventListener('click', (e) => {
    const option = e.target.closest('.style-option');
    if (!option) return;
    document.querySelectorAll('.style-option').forEach(el => el.classList.remove('active'));
    option.classList.add('active');
    state.textStyle = option.dataset.style;
    updatePreview();
  });

  // Sliders
  ['layers', 'saturation', 'blur'].forEach(type => {
    const slider = document.getElementById(type + 'Slider');
    slider.addEventListener('input', () => {
      const display = document.getElementById(type + 'Value');
      display.textContent = slider.value + (type === 'saturation' ? '%' : '');
      updatePreview();
    });
  });

  // Typography sliders
  ['fontSize', 'letterSpacing', 'lineHeight'].forEach(id => {
    const slider = document.getElementById(id + 'Slider');
    if (slider) slider.addEventListener('input', updatePreview);
  });

  // Font weight select
  const fontWeightSelect = document.getElementById('fontWeightSelect');
  if (fontWeightSelect) fontWeightSelect.addEventListener('change', updatePreview);

  // Text color input
  const textColorInput = document.getElementById('textColorInput');
  if (textColorInput) textColorInput.addEventListener('input', updatePreview);

  // Blend mode select
  document.getElementById('blendSelect').addEventListener('change', updatePreview);

  // Seed controls
  document.getElementById('seedInput').addEventListener('input', updatePreview);
  const btnRandomSeed = document.getElementById('btnRandomSeed');
  if (btnRandomSeed) {
    btnRandomSeed.addEventListener('click', () => {
      document.getElementById('seedInput').value = Math.random().toString(36).substring(2, 8);
      updatePreview();
    });
  }
  const btnClearSeed = document.getElementById('btnClearSeed');
  if (btnClearSeed) {
    btnClearSeed.addEventListener('click', () => {
      document.getElementById('seedInput').value = '';
      updatePreview();
    });
  }

  // Collapsible sections
  document.querySelectorAll('[data-toggle-section]').forEach(el => {
    el.addEventListener('click', () => {
      const sectionId = el.dataset.toggleSection;
      document.getElementById(sectionId).classList.toggle('collapsed');
    });
  });

  // Font select
  const fontSelect = document.getElementById('fontSelect');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      handleFontChange(e.target.value);
    });
  }

  // Font file input
  document.getElementById('fontInput').addEventListener('change', (e) => {
    if (e.target.files[0]) handleFontUpload(e.target.files[0]);
  });

  // Outline toggle
  const outlineToggle = document.getElementById('outlineToggle');
  if (outlineToggle) {
    outlineToggle.addEventListener('click', () => {
      if (!state.fontObj) {
        outlineToggle.classList.remove('active');
        return;
      }
      outlineToggle.classList.toggle('active');
      state.outline = outlineToggle.classList.contains('active');
    });
  }

  // Download buttons
  document.getElementById('btnDownloadSVG').addEventListener('click', downloadSVG);
  document.getElementById('btnDownloadPNG').addEventListener('click', downloadPNG);

  // Tab switching
  document.getElementById('tabBar').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });

  // Theme toggle
  document.getElementById('btnTheme').addEventListener('click', () => {
    const next = toggleTheme();
    state.theme = next;
    // Update icon
    document.getElementById('btnTheme').textContent = next === 'dark' ? '☀' : '☾';
  });

  // Language select
  document.getElementById('langSelect').addEventListener('change', (e) => {
    setLocale(e.target.value);
    state.locale = e.target.value;
    applyFontForLocale(e.target.value);
    state.fontFamily = getSvgFontFamily(e.target.value);
    applyTranslations();
    // Re-render palette labels
    document.querySelectorAll('.palette-name').forEach(el => {
      const key = el.dataset.i18nKey;
      if (key) el.textContent = t(key);
    });
    handleFontChange('builtin'); // reload font for new locale
  });

  // Noise pills (event delegation)
  document.getElementById('noisePills').addEventListener('click', (e) => {
    const pill = e.target.closest('.noise-pill');
    if (!pill) return;
    document.querySelectorAll('.noise-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.noiseLevel = pill.dataset.noise;
    updatePreview();
  });

  // Auto text color checkbox
  const textColorAuto = document.getElementById('textColorAuto');
  if (textColorAuto) {
    textColorAuto.addEventListener('change', () => {
      const colorInput = document.getElementById('textColorInput');
      colorInput.disabled = textColorAuto.checked;
      updatePreview();
    });
  }

  // Regenerate button
  document.getElementById('btnRegenerate').addEventListener('click', updatePreview);

  // Resolution pills — update pixel labels
  function updateResolutionLabels() {
    const preset = getScenePreset(state.preset);
    const w = preset ? preset.width : 800;
    const h = preset ? preset.height : 800;
    ['standard', 'hd', '2k', '4k', '8k'].forEach(res => {
      const rp = getResolutionPreset(res);
      const el = document.getElementById('resDims-' + res);
      if (el && rp) el.textContent = `${Math.round(w * rp.scale)}×${Math.round(h * rp.scale)}`;
    });
  }

  // Update preset handler to also update resolution labels
  document.getElementById('presetSelect').addEventListener('change', (e) => {
    state.preset = e.target.value;
    updateResolutionLabels();
    updatePreview();
  });

  // Initialize theme
  state.theme = initTheme();
  document.getElementById('btnTheme').textContent = state.theme === 'dark' ? '☀' : '☾';

  // Initialize locale
  const locale = getLocale();
  state.locale = locale;
  document.getElementById('langSelect').value = locale;
  applyFontForLocale(locale);
  state.fontFamily = getSvgFontFamily(locale);

  // Set version
  document.getElementById('appVersion').textContent = 'v' + pkg.version;

  // Apply translations
  applyTranslations();

  // Update resolution pixel labels
  updateResolutionLabels();

  // Load builtin font and render
  handleFontChange('builtin');
  updatePreview();
}

init();
