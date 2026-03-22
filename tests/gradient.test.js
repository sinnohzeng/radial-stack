import { describe, it, expect } from 'vitest';
import { createRng } from '../src/core/utils.js';
import {
  generateGradientDefs,
  generateGradientStyles,
  generateGradientLayers,
} from '../src/core/gradient.js';

const TEST_COLORS = ['#FF6B6B', '#FF8E53', '#FFA07A', '#FFB347', '#FF69B4'];

describe('generateGradientDefs', () => {
  it('returns defs string and gradientIds array', () => {
    const rng = createRng('test');
    const result = generateGradientDefs(TEST_COLORS, rng, 12);
    expect(result).toHaveProperty('defs');
    expect(result).toHaveProperty('gradientIds');
    expect(typeof result.defs).toBe('string');
    expect(Array.isArray(result.gradientIds)).toBe(true);
  });

  it('produces up to 4 gradient IDs', () => {
    const rng = createRng('ids');
    const { gradientIds } = generateGradientDefs(TEST_COLORS, rng, 12);
    expect(gradientIds.length).toBeLessThanOrEqual(4);
    expect(gradientIds.length).toBeGreaterThan(0);
  });

  it('produces valid SVG radialGradient elements', () => {
    const rng = createRng('svg-defs');
    const { defs } = generateGradientDefs(TEST_COLORS, rng, 12);
    expect(defs).toContain('<radialGradient');
    expect(defs).toContain('</radialGradient>');
    expect(defs).toContain('<stop');
  });

  it('gradient IDs match pattern rg0, rg1, ...', () => {
    const rng = createRng('pattern');
    const { gradientIds } = generateGradientDefs(TEST_COLORS, rng, 12);
    gradientIds.forEach((id, i) => {
      expect(id).toBe(`rg${i}`);
    });
  });

  it('includes fx attribute on gradients', () => {
    const rng = createRng('fx-test');
    const { defs } = generateGradientDefs(TEST_COLORS, rng, 12);
    expect(defs).toContain('fx="');
  });

  it('handles palette with fewer than 4 colors', () => {
    const rng = createRng('small');
    const smallPalette = ['#FF0000', '#00FF00'];
    const { gradientIds } = generateGradientDefs(smallPalette, rng, 12);
    expect(gradientIds.length).toBeLessThanOrEqual(2);
    expect(gradientIds.length).toBeGreaterThan(0);
  });

  it('is deterministic with same seed', () => {
    const rng1 = createRng('det');
    const rng2 = createRng('det');
    const result1 = generateGradientDefs(TEST_COLORS, rng1, 12);
    const result2 = generateGradientDefs(TEST_COLORS, rng2, 12);
    expect(result1.defs).toBe(result2.defs);
    expect(result1.gradientIds).toEqual(result2.gradientIds);
  });
});

describe('generateGradientStyles', () => {
  it('returns a style block string', () => {
    const styles = generateGradientStyles('#E8543E', ['rg0', 'rg1', 'rg2']);
    expect(styles).toContain('<style>');
    expect(styles).toContain('</style>');
  });

  it('includes background fill rule', () => {
    const styles = generateGradientStyles('#E8543E', ['rg0']);
    expect(styles).toContain('#bg{fill:#E8543E}');
  });

  it('includes fill rules for each gradient', () => {
    const ids = ['rg0', 'rg1', 'rg2'];
    const styles = generateGradientStyles('#000', ids);
    ids.forEach((id, i) => {
      expect(styles).toContain(`.r${i}{fill:url(#${id})}`);
    });
  });
});

describe('generateGradientLayers', () => {
  it('produces the correct number of rect layers', () => {
    const rng = createRng('layers');
    const layers = generateGradientLayers(['rg0', 'rg1', 'rg2'], rng, 12, 800);
    const rectCount = (layers.match(/<rect /g) || []).length;
    expect(rectCount).toBe(12);
  });

  it('each layer references a gradient class', () => {
    const rng = createRng('class');
    const layers = generateGradientLayers(['rg0', 'rg1'], rng, 6, 800);
    expect(layers).toContain('class="r0"');
    expect(layers).toContain('class="r1"');
  });

  it('includes transform attributes', () => {
    const rng = createRng('transform');
    const layers = generateGradientLayers(['rg0'], rng, 3, 800);
    expect(layers).toContain('transform="');
    expect(layers).toContain('translate(');
    expect(layers).toContain('scale(');
    expect(layers).toContain('rotate(');
  });

  it('includes opacity attributes', () => {
    const rng = createRng('opacity');
    const layers = generateGradientLayers(['rg0'], rng, 5, 800);
    expect(layers).toContain('opacity="');
  });

  it('respects custom layer count', () => {
    const rng = createRng('count');
    const layers = generateGradientLayers(['rg0', 'rg1'], rng, 20, 800);
    const rectCount = (layers.match(/<rect /g) || []).length;
    expect(rectCount).toBe(20);
  });
});
