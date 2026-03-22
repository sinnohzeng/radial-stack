import { describe, it, expect } from 'vitest';
import {
  hexToOklch,
  oklchToHex,
  interpolateColors,
  midpointColor,
} from '../src/core/color-utils.js';

describe('hexToOklch', () => {
  it('converts a hex color to OKLCH with l, c, h properties', () => {
    const result = hexToOklch('#FF5828');
    expect(result).toHaveProperty('l');
    expect(result).toHaveProperty('c');
    expect(result).toHaveProperty('h');
  });

  it('returns numeric values', () => {
    const result = hexToOklch('#00FF00');
    expect(typeof result.l).toBe('number');
    expect(typeof result.c).toBe('number');
    expect(typeof result.h).toBe('number');
  });

  it('produces lightness in [0, 1] range', () => {
    const black = hexToOklch('#000000');
    const white = hexToOklch('#ffffff');
    expect(black.l).toBeCloseTo(0, 1);
    expect(white.l).toBeCloseTo(1, 1);
  });

  it('produces zero chroma for grayscale', () => {
    const gray = hexToOklch('#808080');
    expect(gray.c).toBeCloseTo(0, 2);
  });

  it('handles 3-digit hex', () => {
    const result = hexToOklch('#f00');
    expect(result.l).toBeGreaterThan(0);
    expect(result.c).toBeGreaterThan(0);
  });
});

describe('oklchToHex', () => {
  it('returns a hex string starting with #', () => {
    const hex = oklchToHex({ l: 0.5, c: 0.1, h: 30 });
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('converts black correctly', () => {
    const hex = oklchToHex({ l: 0, c: 0, h: 0 });
    expect(hex).toBe('#000000');
  });
});

describe('hex -> oklch -> hex round-trip', () => {
  const testColors = ['#ff0000', '#00ff00', '#0000ff', '#ff5828', '#4ecdc4', '#d4af37'];

  testColors.forEach((original) => {
    it(`round-trips ${original} within tolerance`, () => {
      const oklch = hexToOklch(original);
      const roundTripped = oklchToHex(oklch);

      // Parse both as integers and compare channel-by-channel
      const origR = parseInt(original.slice(1, 3), 16);
      const origG = parseInt(original.slice(3, 5), 16);
      const origB = parseInt(original.slice(5, 7), 16);
      const rtR = parseInt(roundTripped.slice(1, 3), 16);
      const rtG = parseInt(roundTripped.slice(3, 5), 16);
      const rtB = parseInt(roundTripped.slice(5, 7), 16);

      // Allow up to 2 units per channel due to floating point
      expect(Math.abs(origR - rtR)).toBeLessThanOrEqual(2);
      expect(Math.abs(origG - rtG)).toBeLessThanOrEqual(2);
      expect(Math.abs(origB - rtB)).toBeLessThanOrEqual(2);
    });
  });
});

describe('interpolateColors', () => {
  it('returns color1 at t=0', () => {
    const result = interpolateColors('#ff0000', '#0000ff', 0);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    // Should be very close to red
    const r = parseInt(result.slice(1, 3), 16);
    expect(r).toBeGreaterThan(200);
  });

  it('returns color2 at t=1', () => {
    const result = interpolateColors('#ff0000', '#0000ff', 1);
    const b = parseInt(result.slice(5, 7), 16);
    expect(b).toBeGreaterThan(200);
  });

  it('returns an intermediate color at t=0.5', () => {
    const result = interpolateColors('#ff0000', '#0000ff', 0.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    // Should not be pure red or pure blue
    const r = parseInt(result.slice(1, 3), 16);
    const b = parseInt(result.slice(5, 7), 16);
    expect(r).toBeLessThan(255);
    expect(b).toBeLessThan(255);
  });

  it('returns valid hex at various t values', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const result = interpolateColors('#FF6B6B', '#4ECDC4', t);
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('midpointColor', () => {
  it('returns a valid hex color', () => {
    const mid = midpointColor('#FF6B6B', '#4ECDC4');
    expect(mid).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns the same result as interpolateColors at t=0.5', () => {
    const mid = midpointColor('#FF6B6B', '#4ECDC4');
    const interp = interpolateColors('#FF6B6B', '#4ECDC4', 0.5);
    expect(mid).toBe(interp);
  });

  it('produces a color different from both inputs for distinct colors', () => {
    const mid = midpointColor('#ff0000', '#0000ff');
    expect(mid).not.toBe('#ff0000');
    expect(mid).not.toBe('#0000ff');
  });
});
