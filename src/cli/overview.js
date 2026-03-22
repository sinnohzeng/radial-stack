// @ts-check

/**
 * @typedef {Object} OverviewItem
 * @property {string} name
 * @property {string} svg - Complete SVG string
 * @property {string} palette - Palette name used
 */

/**
 * Generate an overview HTML page that displays all generated SVG badges.
 * SVGs are embedded directly in the HTML (not dynamically set via innerHTML)
 * to avoid XSS concerns — all content is generated at build time by this tool.
 *
 * @param {OverviewItem[]} items
 * @param {Object} [meta={}]
 * @param {string} [meta.configSummary]
 * @returns {string}
 */
export function generateOverviewHTML(items, meta = {}) {
  const timestamp = new Date().toLocaleString('zh-CN');
  const cards = items
    .map(
      (item) => `
      <div class="card">
        <div class="card-svg">${item.svg}</div>
        <div class="card-info">
          <span class="card-name">${escapeHTML(item.name)}</span>
          <span class="card-palette">${escapeHTML(item.palette)}</span>
        </div>
      </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>部门标识图总览</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0f0f0f; color:#e0e0e0; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:32px; }
  .header { text-align:center; margin-bottom:40px; }
  .header h1 { font-size:28px; font-weight:600; margin-bottom:8px; }
  .header .meta { color:#666; font-size:14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:24px; max-width:1400px; margin:0 auto; }
  .card { background:#1a1a1a; border-radius:12px; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; }
  .card:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,0.4); }
  .card-svg { aspect-ratio:1; overflow:hidden; }
  .card-svg svg { width:100%; height:100%; display:block; }
  .card-info { padding:12px 16px; display:flex; justify-content:space-between; align-items:center; }
  .card-name { font-weight:500; font-size:15px; }
  .card-palette { font-size:12px; color:#666; background:#252525; padding:2px 8px; border-radius:4px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Radial Stack — 标识图总览</h1>
    <div class="meta">共 ${items.length} 个 · 生成于 ${timestamp}${meta.configSummary ? ' · ' + escapeHTML(meta.configSummary) : ''}</div>
  </div>
  <div class="grid">${cards}
  </div>
  <footer style="text-align:center;padding:40px 0 20px;color:#444;font-size:12px;">
    &copy; 2026 Zeng Zixuan &middot; MIT License &middot; Powered by Radial Stack
  </footer>
</body>
</html>`;
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
