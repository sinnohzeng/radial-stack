import { describe, test, expect } from 'vitest';
import { buildSVG } from '../src/core/svg-builder.js';

describe('SVG snapshot tests', () => {
  test('square preset with warm palette matches snapshot', () => {
    const svg = buildSVG({ name: 'test', size: 100, palette: 'warm', seed: 'fixed' });
    expect(svg).toMatchSnapshot();
  });

  test('cool palette with overlay text matches snapshot', () => {
    const svg = buildSVG({
      name: 'hello',
      size: 200,
      palette: 'cool',
      textStyle: 'overlay',
      seed: 'snapshot',
    });
    expect(svg).toMatchSnapshot();
  });

  test('vertical text with ocean palette matches snapshot', () => {
    const svg = buildSVG({
      name: '部门',
      size: 150,
      palette: 'ocean',
      textStyle: 'vertical',
      seed: 'vert',
    });
    expect(svg).toMatchSnapshot();
  });

  test('no text style matches snapshot', () => {
    const svg = buildSVG({
      name: '',
      size: 100,
      palette: 'sunset',
      textStyle: 'none',
      seed: 'empty',
    });
    expect(svg).toMatchSnapshot();
  });
});
