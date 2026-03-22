import { describe, it, expect } from 'vitest';
import {
  getPalette,
  getAllPaletteNames,
  getAllPalettes,
  resolvePalette,
  hintToPaletteName,
} from '../src/core/palettes.js';

const EXPECTED_PALETTES = [
  'warm',
  'cool',
  'sunset',
  'forest',
  'ocean',
  'creative',
  'tech',
  'elegant',
  'peach',
  'mint',
  'aurora',
  'blush',
];

describe('getAllPaletteNames', () => {
  it('returns exactly 12 palette names', () => {
    const names = getAllPaletteNames();
    expect(names).toHaveLength(12);
  });

  it('contains all expected palette names', () => {
    const names = getAllPaletteNames();
    for (const expected of EXPECTED_PALETTES) {
      expect(names).toContain(expected);
    }
  });
});

describe('getAllPalettes', () => {
  it('returns 12 palette objects', () => {
    expect(getAllPalettes()).toHaveLength(12);
  });
});

describe('getPalette', () => {
  EXPECTED_PALETTES.forEach((name) => {
    describe(`palette: ${name}`, () => {
      it('exists and is defined', () => {
        const palette = getPalette(name);
        expect(palette).toBeDefined();
      });

      it('has required properties', () => {
        const palette = getPalette(name);
        expect(palette).toHaveProperty('name', name);
        expect(palette).toHaveProperty('label');
        expect(palette).toHaveProperty('colors');
        expect(palette).toHaveProperty('background');
      });

      it('has 4-7 colors', () => {
        const palette = getPalette(name);
        expect(palette.colors.length).toBeGreaterThanOrEqual(4);
        expect(palette.colors.length).toBeLessThanOrEqual(7);
      });

      it('has valid hex colors', () => {
        const palette = getPalette(name);
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        for (const color of palette.colors) {
          expect(color).toMatch(hexRegex);
        }
      });

      it('has a valid hex background', () => {
        const palette = getPalette(name);
        expect(palette.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  it('returns undefined for non-existent palette', () => {
    expect(getPalette('nonexistent')).toBeUndefined();
  });
});

describe('resolvePalette', () => {
  it('resolves a named palette', () => {
    const palette = resolvePalette('warm');
    expect(palette.name).toBe('warm');
    expect(palette.colors.length).toBeGreaterThan(0);
  });

  it('throws for unknown palette name', () => {
    expect(() => resolvePalette('nonexistent')).toThrow(/Unknown palette/);
  });

  it('resolves custom color arrays', () => {
    const customColors = ['#111111', '#222222', '#333333'];
    const palette = resolvePalette(customColors);
    expect(palette.name).toBe('custom');
    expect(palette.colors).toEqual(customColors);
    expect(palette.background).toBe('#111111');
  });

  it('returns a palette with label for custom colors', () => {
    const palette = resolvePalette(['#aabbcc', '#ddeeff']);
    expect(palette.label).toBeDefined();
  });
});

describe('hintToPaletteName', () => {
  it('maps direct palette names', () => {
    expect(hintToPaletteName('warm')).toBe('warm');
    expect(hintToPaletteName('cool')).toBe('cool');
    expect(hintToPaletteName('sunset')).toBe('sunset');
  });

  it('maps alias hints', () => {
    expect(hintToPaletteName('hot')).toBe('warm');
    expect(hintToPaletteName('cold')).toBe('cool');
    expect(hintToPaletteName('nature')).toBe('forest');
    expect(hintToPaletteName('sea')).toBe('ocean');
    expect(hintToPaletteName('art')).toBe('creative');
    expect(hintToPaletteName('business')).toBe('elegant');
  });

  it('is case-insensitive', () => {
    expect(hintToPaletteName('WARM')).toBe('warm');
    expect(hintToPaletteName('Cool')).toBe('cool');
  });

  it('defaults to warm for unknown hints', () => {
    expect(hintToPaletteName('unknown')).toBe('warm');
  });
});
