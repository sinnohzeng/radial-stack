// @ts-check
import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { buildSVG } from '../core/svg-builder.js';
import { hintToPaletteName, getAllPaletteNames } from '../core/palettes.js';
import {
  getScenePreset,
  getResolutionPreset,
  getAllScenePresetNames,
  getAllResolutionPresetNames,
  computeExportSize,
  formatPresetListing,
} from '../core/presets.js';
import { readInput } from './file-reader.js';
import { svgToPng } from './png-export.js';
import { generateOverviewHTML } from './overview.js';

/**
 * @typedef {import('../core/svg-builder.js').BuildOptions} BuildOptions
 */

/**
 * Merge CLI options with config file and defaults.
 * Priority: CLI > config file > defaults.
 * @param {object} cliOpts
 * @returns {object}
 */
function resolveConfig(cliOpts) {
  let fileConfig = {};
  if (cliOpts.config) {
    const configPath = resolve(cliOpts.config);
    if (!existsSync(configPath)) {
      console.error(`❌ 配置文件不存在: ${configPath}`);
      process.exit(1);
    }
    fileConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  }

  // Load default config if exists
  const defaultConfigPath = resolve('config/default.json');
  let defaultConfig = {};
  if (existsSync(defaultConfigPath)) {
    defaultConfig = JSON.parse(readFileSync(defaultConfigPath, 'utf-8'));
  }

  return { ...defaultConfig, ...fileConfig, ...stripUndefined(cliOpts) };
}

/**
 * Remove undefined values from an object.
 * @param {object} obj
 * @returns {object}
 */
function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * Validate config values and print warnings.
 * @param {object} config
 */
function validateConfig(config) {
  if (config.layers !== undefined) {
    const layers = Number(config.layers);
    if (isNaN(layers) || layers < 1 || layers > 30) {
      console.error('❌ --layers 应在 1-30 之间');
      process.exit(1);
    }
  }
  if (config.blur !== undefined) {
    const blur = Number(config.blur);
    if (isNaN(blur) || blur < 0 || blur > 50) {
      console.error('❌ --blur 应在 0-50 之间');
      process.exit(1);
    }
  }
  if (config.palette && typeof config.palette === 'string') {
    const names = getAllPaletteNames();
    if (!names.includes(config.palette)) {
      console.error(`❌ 未知配色方案 "${config.palette}"。可用: ${names.join(', ')}`);
      process.exit(1);
    }
  }
  const validStyles = ['pill', 'overlay', 'vertical', 'artistic', 'none'];
  if (config.textStyle && !validStyles.includes(config.textStyle)) {
    console.error(`❌ 未知文字样式 "${config.textStyle}"。可用: ${validStyles.join(', ')}`);
    process.exit(1);
  }
  if (config.preset) {
    const presetNames = getAllScenePresetNames();
    if (!presetNames.includes(config.preset)) {
      console.error(`❌ 未知场景预设 "${config.preset}"。可用: ${presetNames.join(', ')}`);
      process.exit(1);
    }
  }
  if (config.resolution) {
    const resNames = getAllResolutionPresetNames();
    if (!resNames.includes(config.resolution)) {
      console.error(`❌ 未知分辨率预设 "${config.resolution}"。可用: ${resNames.join(', ')}`);
      process.exit(1);
    }
  }
}

/**
 * Generate a single badge.
 * @param {object} entry
 * @param {object} config
 * @param {string} outputDir
 * @param {number} [index]
 * @param {number} [total]
 */
async function generateOne(entry, config, outputDir, index, total) {
  const name = entry.name;
  const palette = entry.color_hint ? hintToPaletteName(entry.color_hint) : config.palette || 'warm';

  if (index !== undefined && total !== undefined) {
    console.log(`  [${index + 1}/${total}] 正在生成: ${name}...`);
  }

  // Resolve dimensions from preset or config
  const scenePreset = config.preset ? getScenePreset(config.preset) : null;
  const resPreset = config.resolution ? getResolutionPreset(config.resolution) : null;

  const svgWidth = scenePreset
    ? scenePreset.width
    : Number(config.width) || Number(config.size) || 800;
  const svgHeight = scenePreset
    ? scenePreset.height
    : Number(config.height) || Number(config.size) || 800;

  // Load font if --font-path is specified (for measurement + outline)
  let fontObj = null;
  if (config.fontPath) {
    try {
      const opentype = await import('opentype.js');
      const ot = opentype.default || opentype;
      fontObj = ot.loadSync(resolve(config.fontPath));
    } catch (e) {
      console.warn(`⚠️  字体加载失败: ${e.message}`);
    }
  }

  // Handle \n escape in name for CLI
  const processedName = name.replace(/\\n/g, '\n');

  /** @type {BuildOptions} */
  const opts = {
    name: processedName,
    width: svgWidth,
    height: svgHeight,
    palette,
    seed: entry.seed || config.seed,
    layers: Number(config.layers) || 8,
    blur: config.blur !== undefined ? Number(config.blur) : 3,
    noise: config.noise === true || config.noise === 'true',
    saturation: Number(config.saturation) || 130,
    textStyle: config.textStyle || 'pill',
    fontSize: config.fontSize ? Number(config.fontSize) : undefined,
    blendMode: config.blendMode,
    decorations: config.decorations || {},
    pill: config.pill,
    overlay: config.overlay,
    font: fontObj,
    outline: config.outline && !!fontObj,
  };

  const svg = buildSVG(opts);

  // Write SVG — use first line of name for filename
  const fileName = processedName.split('\n')[0];
  const svgPath = join(outputDir, `${fileName}.svg`);
  writeFileSync(svgPath, svg, 'utf-8');

  // Write PNG if requested
  if (config.png) {
    let pngW, pngH;
    if (scenePreset && resPreset) {
      const dims = computeExportSize(scenePreset, resPreset);
      pngW = dims.pngWidth;
      pngH = dims.pngHeight;
    } else if (scenePreset) {
      pngW = scenePreset.pngWidth;
      pngH = scenePreset.pngHeight;
    } else if (resPreset) {
      pngW = svgWidth * resPreset.scale;
      pngH = svgHeight * resPreset.scale;
    } else {
      const pngSize = Number(config.pngSize) || 1024;
      pngW = pngSize;
      pngH = svgWidth === svgHeight ? pngSize : Math.round(pngSize * (svgHeight / svgWidth));
    }
    const { buffer, warnings } = svgToPng(svg, {
      width: pngW,
      height: pngH,
      fontPath: config.fontPath,
    });
    const pngPath = join(outputDir, `${fileName}.png`);
    writeFileSync(pngPath, buffer);
    warnings.forEach((w) => console.warn(w));
  }

  return { name, svg, palette };
}

export function createProgram() {
  const program = new Command();

  program
    .name('radial-stack')
    .description('基于 SVG 多层径向渐变叠加的文本标识图生成器')
    .version('1.0.0');

  program
    .option('-i, --input <path>', '输入文件路径 (JSON/CSV/TXT)')
    .option('-n, --name <name>', '单个部门名称')
    .option('-o, --output <dir>', '输出目录', './output')
    .option('-c, --config <path>', '配置文件路径')
    .option('-p, --palette <name>', '配色方案名称')
    .option('-t, --text-style <style>', '文字样式: pill|overlay|vertical|artistic|none')
    .option('-l, --layers <n>', '渐变层数 (1-30)')
    .option('--blur <n>', '模糊程度 (0-50)')
    .option('--noise', '启用噪声纹理')
    .option('--saturation <n>', '饱和度百分比')
    .option('--seed <seed>', '随机种子')
    .option('--png', '同时导出 PNG')
    .option('--png-size <n>', 'PNG 尺寸 (像素)')
    .option('--font-path <path>', '字体文件路径 (TTF/OTF)')
    .option('--outline', '将文字转为轮廓路径（需配合 --font-path）')
    .option('--blend-mode <mode>', '混合模式: soft-light|multiply|screen')
    .option('--no-overview', '不生成总览 HTML')
    .option('--preset <name>', '场景预设 (如 banner-wide, wechat-cover)')
    .option('--resolution <name>', '分辨率预设: standard|hd|2k|4k|8k')
    .option('--width <n>', '画布宽度 (覆盖 size)')
    .option('--height <n>', '画布高度 (覆盖 size)')
    .option('--list-presets', '列出所有可用预设')
    .action(async (opts) => {
      // Handle --list-presets
      if (opts.listPresets) {
        console.log(formatPresetListing());
        return;
      }

      if (!opts.input && !opts.name) {
        console.error('❌ 请指定 --input 文件或 --name 部门名称');
        program.help();
        return;
      }

      const config = resolveConfig(opts);
      validateConfig(config);

      if (config.outline && !config.fontPath) {
        console.error('❌ --outline 需要同时指定 --font-path');
        process.exit(1);
      }

      // Ensure output directory exists
      const outputDir = resolve(config.output || './output');
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      let entries;
      if (config.input) {
        const inputPath = resolve(config.input);
        if (!existsSync(inputPath)) {
          console.error(`❌ 输入文件不存在: ${inputPath}`);
          process.exit(1);
        }
        entries = readInput(inputPath);
        console.log(`📋 读取到 ${entries.length} 个部门`);
      } else {
        entries = [{ name: config.name }];
      }

      console.log(`🎨 配色方案: ${config.palette || 'warm'}`);
      console.log(`📝 文字样式: ${config.textStyle || 'pill'}`);
      console.log(`📁 输出目录: ${outputDir}\n`);

      const results = [];
      for (let i = 0; i < entries.length; i++) {
        results.push(await generateOne(entries[i], config, outputDir, i, entries.length));
      }

      // Generate overview HTML
      if (config.overview !== false && entries.length > 1) {
        const overviewPath = join(outputDir, 'overview.html');
        const html = generateOverviewHTML(results, {
          configSummary: `配色:${config.palette || 'warm'} 样式:${config.textStyle || 'pill'} 层数:${config.layers || 8}${config.preset ? ` 预设:${config.preset}` : ''}`,
        });
        writeFileSync(overviewPath, html, 'utf-8');
        console.log(`\n📄 总览页面: ${overviewPath}`);
      }

      console.log(`\n✅ 完成！共生成 ${results.length} 个文件`);
    });

  return program;
}
