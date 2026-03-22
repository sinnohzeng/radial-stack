import { describe, it, expect } from 'vitest';
import { buildSVG } from '../src/core/svg-builder.js';

describe('reproducibility', () => {
  it('same name produces identical SVG on two calls', () => {
    const svg1 = buildSVG({ name: 'Engineering' });
    const svg2 = buildSVG({ name: 'Engineering' });
    expect(svg1).toBe(svg2);
  });

  it('same name + same palette produces identical SVG', () => {
    const svg1 = buildSVG({ name: 'Design', palette: 'creative' });
    const svg2 = buildSVG({ name: 'Design', palette: 'creative' });
    expect(svg1).toBe(svg2);
  });

  it('same name + same explicit seed produces identical SVG', () => {
    const svg1 = buildSVG({ name: 'Sales', seed: 'my-seed-42' });
    const svg2 = buildSVG({ name: 'Sales', seed: 'my-seed-42' });
    expect(svg1).toBe(svg2);
  });

  it('same config with all options produces identical SVG', () => {
    const config = {
      name: 'Marketing',
      size: 600,
      palette: 'sunset',
      seed: 'repro-test',
      layers: 8,
      blur: 3,
      noise: true,
      saturation: 120,
      textStyle: 'overlay',
      fontSize: 50,
      blendMode: 'screen',
      decorations: { border: true, cornerBadge: '01' },
    };
    const svg1 = buildSVG(config);
    const svg2 = buildSVG(config);
    expect(svg1).toBe(svg2);
  });

  it('same name with artistic text style is reproducible', () => {
    const svg1 = buildSVG({ name: 'Art', textStyle: 'artistic', seed: 'art-seed' });
    const svg2 = buildSVG({ name: 'Art', textStyle: 'artistic', seed: 'art-seed' });
    expect(svg1).toBe(svg2);
  });

  it('different names produce different SVGs', () => {
    const svg1 = buildSVG({ name: 'Alpha' });
    const svg2 = buildSVG({ name: 'Beta' });
    expect(svg1).not.toBe(svg2);
  });

  it('different seeds produce different SVGs', () => {
    const svg1 = buildSVG({ name: 'Team', seed: 'seed-a' });
    const svg2 = buildSVG({ name: 'Team', seed: 'seed-b' });
    expect(svg1).not.toBe(svg2);
  });

  it('different palettes produce different SVGs', () => {
    const svg1 = buildSVG({ name: 'Team', palette: 'warm', seed: 'same' });
    const svg2 = buildSVG({ name: 'Team', palette: 'ocean', seed: 'same' });
    expect(svg1).not.toBe(svg2);
  });

  it('reproducible across 10 iterations', () => {
    const reference = buildSVG({ name: 'Consistency', palette: 'tech', seed: 'stable' });
    for (let i = 0; i < 10; i++) {
      const result = buildSVG({ name: 'Consistency', palette: 'tech', seed: 'stable' });
      expect(result).toBe(reference);
    }
  });

  it('unicode names are reproducible', () => {
    const svg1 = buildSVG({ name: '研发部门' });
    const svg2 = buildSVG({ name: '研发部门' });
    expect(svg1).toBe(svg2);
  });

  it('names with special characters are reproducible', () => {
    const svg1 = buildSVG({ name: 'R&D <Team>' });
    const svg2 = buildSVG({ name: 'R&D <Team>' });
    expect(svg1).toBe(svg2);
  });
});
