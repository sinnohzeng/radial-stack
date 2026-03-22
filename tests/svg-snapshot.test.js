import { describe, test, expect } from 'vitest';
import { buildSVG } from '../src/core/svg-builder.js';

describe('SVG structural regression tests', () => {
  test('square preset with warm palette produces valid SVG', () => {
    const svg = buildSVG({ name: 'test', size: 100, palette: 'warm', seed: 'fixed' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="100"');
    expect(svg).toContain('height="100"');
    expect(svg).toContain('<radialGradient');
    expect(svg).toContain('test');
  });

  test('cool palette with overlay text has overlay elements', () => {
    const svg = buildSVG({
      name: 'hello',
      size: 200,
      palette: 'cool',
      textStyle: 'overlay',
      seed: 'snapshot',
    });
    expect(svg).toContain('width="200"');
    expect(svg).toContain('hello');
    expect(svg).toContain('font-size');
  });

  test('vertical text with ocean palette has character elements', () => {
    const svg = buildSVG({
      name: '部门',
      size: 150,
      palette: 'ocean',
      textStyle: 'vertical',
      seed: 'vert',
    });
    expect(svg).toContain('width="150"');
    expect(svg).toContain('部');
    expect(svg).toContain('门');
  });

  test('no text style produces SVG without text', () => {
    const svg = buildSVG({
      name: '',
      size: 100,
      palette: 'sunset',
      textStyle: 'none',
      seed: 'empty',
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('<radialGradient');
    expect(svg).not.toContain('<text');
  });

  test('same seed produces identical output', () => {
    const opts = { name: 'determinism', size: 100, palette: 'warm', seed: 'abc' };
    const a = buildSVG(opts);
    const b = buildSVG(opts);
    expect(a).toBe(b);
  });
});
