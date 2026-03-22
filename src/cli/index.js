// @ts-check
import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { buildSVG } from '../core/svg-builder.js';
import { resolvePalette, hintToPaletteName, getAllPaletteNames } from '../core/palettes.js';
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
  const validStyles = ['pill', 'overlay', 'vertical', 'artistic'];
  if (config.textStyle && !validStyles.includes(config.textStyle)) {
    console.error(`❌ 未知文字样式 "${config.textStyle}"。可用: ${validStyles.join(', ')}`);
    process.exit(1);
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
function generateOne(entry, config, outputDir, index, total) {
  const name = entry.name;
  const palette = entry.color_hint
    ? hintToPaletteName(entry.color_hint)
    : config.palette || 'warm';

  if (index !== undefined && total !== undefined) {
    console.log(`  [${index + 1}/${total}] 正在生成: ${name}...`);
  }

  /** @type {BuildOptions} */
  const opts = {
    name,
    size: Number(config.size) || 800,
    palette,
    seed: entry.seed || config.seed,
    layers: Number(config.layers) || 12,
    blur: Number(config.blur) || 0,
    noise: config.noise === true || config.noise === 'true',
    saturation: Number(config.saturation) || 130,
    textStyle: config.textStyle || 'pill',
    fontSize: config.fontSize ? Number(config.fontSize) : undefined,
    blendMode: config.blendMode,
    decorations: config.decorations || {},
    pill: config.pill,
    overlay: config.overlay,
  };

  const svg = buildSVG(opts);

  // Write SVG
  const svgPath = join(outputDir, `${name}.svg`);
  writeFileSync(svgPath, svg, 'utf-8');

  // Write PNG if requested
  if (config.png) {
    const pngSize = Number(config.pngSize) || 1024;
    const { buffer, warnings } = svgToPng(svg, {
      width: pngSize,
      height: pngSize,
      fontPath: config.fontPath,
    });
    const pngPath = join(outputDir, `${name}.png`);
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
    .option('-t, --text-style <style>', '文字样式: pill|overlay|vertical|artistic')
    .option('-l, --layers <n>', '渐变层数 (1-30)', '12')
    .option('--blur <n>', '模糊程度 (0-50)', '0')
    .option('--noise', '启用噪声纹理')
    .option('--saturation <n>', '饱和度百分比', '130')
    .option('--seed <seed>', '随机种子')
    .option('--png', '同时导出 PNG')
    .option('--png-size <n>', 'PNG 尺寸 (像素)', '1024')
    .option('--font-path <path>', 'PNG 导出用的中文字体路径')
    .option('--blend-mode <mode>', '混合模式: soft-light|multiply|screen')
    .option('--no-overview', '不生成总览 HTML')
    .action((opts) => {
      if (!opts.input && !opts.name) {
        console.error('❌ 请指定 --input 文件或 --name 部门名称');
        program.help();
        return;
      }

      const config = resolveConfig(opts);
      validateConfig(config);

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

      const results = entries.map((entry, i) =>
        generateOne(entry, config, outputDir, i, entries.length)
      );

      // Generate overview HTML
      if (config.overview !== false && entries.length > 1) {
        const overviewPath = join(outputDir, 'overview.html');
        const html = generateOverviewHTML(results, {
          configSummary: `配色:${config.palette || 'warm'} 样式:${config.textStyle || 'pill'} 层数:${config.layers || 12}`,
        });
        writeFileSync(overviewPath, html, 'utf-8');
        console.log(`\n📄 总览页面: ${overviewPath}`);
      }

      console.log(`\n✅ 完成！共生成 ${results.length} 个文件`);
    });

  return program;
}
