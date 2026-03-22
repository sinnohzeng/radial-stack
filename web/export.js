import { state } from './state.js';
import { buildSVG } from '../src/core/svg-builder.js';
import { getScenePreset, getResolutionPreset, computeExportSize } from '../src/core/presets.js';
import { t } from './i18n.js';

export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- Shared canvas rendering pipeline ---

function renderToCanvas(options = {}) {
  return new Promise((resolve, reject) => {
    if (!state.lastSVG) return reject(new Error('No SVG'));

    const { fillBackground } = options;
    let svg = state.lastSVG;
    if (state.outline && state.fontObj) {
      svg = buildSVG({ ...state.currentOptions, outline: true, font: state.fontObj });
    }

    const preset = getScenePreset(state.preset);
    const resPreset = getResolutionPreset(state.resolution);
    let w, h;

    if (preset && resPreset) {
      const dims = computeExportSize(preset, resPreset);
      w = dims.pngWidth;
      h = dims.pngHeight;
    } else {
      w = 1024;
      h = 1024;
    }

    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (fillBackground) {
        ctx.fillStyle = fillBackground;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve({ canvas, width: w, height: h });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG to image'));
    };

    img.src = url;
  });
}

function getExportFilename(ext) {
  const resLabel = state.resolution !== 'standard' ? '_' + state.resolution : '';
  return (state.lastName || t('file.default_name')) + resLabel + '.' + ext;
}

// --- SVG ---

export function downloadSVG() {
  if (!state.lastSVG) return;
  let svg = state.lastSVG;
  if (state.outline && state.fontObj) {
    svg = buildSVG({ ...state.currentOptions, outline: true, font: state.fontObj });
  }
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  downloadBlob(blob, (state.lastName || t('file.default_name')) + '.svg');
}

// --- PNG ---

export async function downloadPNG() {
  try {
    const { canvas } = await renderToCanvas();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob(blob, getExportFilename('png'));
      },
      'image/png',
    );
  } catch (e) {
    console.error('PNG export failed:', e.message);
  }
}

// --- JPG with adaptive quality compression ---

const JPG_TARGET_SIZE = 2 * 1024 * 1024; // 2MB

function compressToTarget(canvas) {
  return new Promise((resolve) => {
    let lo = 0.75;
    let hi = 0.92;

    // Try highest quality first — if already ≤ target, no iteration needed
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size <= JPG_TARGET_SIZE) return resolve(blob);

        // Binary search for optimal quality
        const search = () => {
          if (hi - lo < 0.03) {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', lo);
            return;
          }
          const mid = (lo + hi) / 2;
          canvas.toBlob(
            (b) => {
              if (b.size > JPG_TARGET_SIZE) {
                hi = mid;
              } else {
                lo = mid;
              }
              search();
            },
            'image/jpeg',
            mid,
          );
        };
        search();
      },
      'image/jpeg',
      hi,
    );
  });
}

export async function downloadJPG() {
  try {
    const { canvas } = await renderToCanvas({ fillBackground: '#ffffff' });
    const blob = await compressToTarget(canvas);
    if (!blob) return;
    downloadBlob(blob, getExportFilename('jpg'));
  } catch (e) {
    console.error('JPG export failed:', e.message);
  }
}
