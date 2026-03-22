import { state } from './state.js';
import { buildSVG } from '../src/core/svg-builder.js';
import { getScenePreset, getResolutionPreset, computeExportSize } from '../src/core/presets.js';

export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function downloadSVG() {
  if (!state.lastSVG) return;
  let svg = state.lastSVG;
  if (state.outline && state.fontObj) {
    svg = buildSVG({ ...state.currentOptions, outline: true, font: state.fontObj });
  }
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  downloadBlob(blob, (state.lastName || '渐变') + '.svg');
}

export function downloadPNG() {
  if (!state.lastSVG) return;

  const preset = getScenePreset(state.preset);
  const resPreset = getResolutionPreset(state.resolution);
  let pngW, pngH;

  if (preset && resPreset) {
    const dims = computeExportSize(preset, resPreset);
    pngW = dims.pngWidth;
    pngH = dims.pngHeight;
  } else {
    pngW = 1024;
    pngH = 1024;
  }

  const svgBlob = new Blob([state.lastSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pngW;
    canvas.height = pngH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, pngW, pngH);
    canvas.toBlob(blob => {
      const resLabel = state.resolution !== 'standard' ? '_' + state.resolution : '';
      downloadBlob(blob, (state.lastName || '渐变') + resLabel + '.png');
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.src = url;
}
