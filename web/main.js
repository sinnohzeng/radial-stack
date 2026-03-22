import './style.css';
import { buildSVG } from '../src/core/svg-builder.js';
import { getAllPalettes } from '../src/core/palettes.js';
import { getAllScenePresets, getAllResolutionPresets, getScenePreset, getResolutionPreset, computeExportSize } from '../src/core/presets.js';

// --- State ---
let currentPalette = 'warm';
let currentTextStyle = 'pill';
let currentPreset = 'square';
let currentResolution = 'standard';
let lastSVG = '';
let lastName = '';

// --- Core functions ---

function updatePreview() {
  const name = document.getElementById('nameInput').value || '部门名称';
  const layers = parseInt(document.getElementById('layersSlider').value);
  const saturation = parseInt(document.getElementById('saturationSlider').value);
  const blur = parseInt(document.getElementById('blurSlider').value);
  const noise = document.getElementById('noiseToggle').classList.contains('active');
  const blendMode = document.getElementById('blendSelect').value || undefined;
  const seed = document.getElementById('seedInput').value || undefined;

  const preset = getScenePreset(currentPreset);
  const w = preset ? preset.width : 800;
  const h = preset ? preset.height : 800;

  const svg = buildSVG({
    name,
    width: w,
    height: h,
    palette: currentPalette,
    textStyle: currentTextStyle,
    layers, saturation, blur, noise, blendMode, seed,
  });

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

  lastSVG = svg;
  lastName = name;
}

function setPreset() {
  currentPreset = document.getElementById('presetSelect').value;
  updatePreview();
}

function setResolution(el) {
  document.querySelectorAll('.res-pill').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  currentResolution = el.dataset.res;
}

function setPalette(el) {
  document.querySelectorAll('.palette-option').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  currentPalette = el.dataset.palette;
  updatePreview();
}

function setTextStyle(el) {
  document.querySelectorAll('.style-option').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  currentTextStyle = el.dataset.style;
  updatePreview();
}

function updateSlider(type) {
  const slider = document.getElementById(type + 'Slider');
  const display = document.getElementById(type + 'Value');
  display.textContent = slider.value + (type === 'saturation' ? '%' : '');
  updatePreview();
}

function toggleNoise() {
  document.getElementById('noiseToggle').classList.toggle('active');
  updatePreview();
}

function randomizeSeed() {
  document.getElementById('seedInput').value = Math.random().toString(36).substring(2, 8);
  updatePreview();
}

function clearSeed() {
  document.getElementById('seedInput').value = '';
  updatePreview();
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadSVG() {
  if (!lastSVG) return;
  const blob = new Blob([lastSVG], { type: 'image/svg+xml' });
  downloadBlob(blob, (lastName || '渐变') + '.svg');
}

function downloadPNG() {
  if (!lastSVG) return;

  const preset = getScenePreset(currentPreset);
  const resPreset = getResolutionPreset(currentResolution);
  let pngW, pngH;

  if (preset && resPreset) {
    const dims = computeExportSize(preset, resPreset);
    pngW = dims.pngWidth;
    pngH = dims.pngHeight;
  } else {
    pngW = 1024;
    pngH = 1024;
  }

  const svgBlob = new Blob([lastSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pngW;
    canvas.height = pngH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, pngW, pngH);
    canvas.toBlob(blob => {
      const resLabel = currentResolution !== 'standard' ? '_' + currentResolution : '';
      downloadBlob(blob, (lastName || '渐变') + resLabel + '.png');
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.src = url;
}

// --- Expose to inline onclick handlers ---
window.updatePreview = updatePreview;
window.setPreset = setPreset;
window.setResolution = setResolution;
window.setPalette = setPalette;
window.setTextStyle = setTextStyle;
window.updateSlider = updateSlider;
window.toggleNoise = toggleNoise;
window.randomizeSeed = randomizeSeed;
window.clearSeed = clearSeed;
window.downloadSVG = downloadSVG;
window.downloadPNG = downloadPNG;

// --- Initialize ---
const palettes = getAllPalettes();
const grid = document.getElementById('paletteGrid');
palettes.forEach((p, i) => {
  const div = document.createElement('div');
  div.className = 'palette-option' + (i === 0 ? ' active' : '');
  div.dataset.palette = p.name;
  div.onclick = () => setPalette(div);

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
  nameSpan.textContent = p.label;

  div.appendChild(dotsDiv);
  div.appendChild(nameSpan);
  grid.appendChild(div);
});

document.getElementById('nameInput').addEventListener('input', updatePreview);
updatePreview();
