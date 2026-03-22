import { describe, it, expect } from 'vitest';
import { createRng } from '../src/core/utils.js';
import {
  autoFontSize,
  pillLayout,
  overlayLayout,
  verticalLayout,
  artisticLayout,
  layoutText,
} from '../src/core/text-layout.js';

describe('autoFontSize', () => {
  it('returns 80 for 1-2 character names', () => {
    expect(autoFontSize('AB')).toBe(80);
    expect(autoFontSize('X')).toBe(80);
  });

  it('returns 72 for 3 character names', () => {
    expect(autoFontSize('ABC')).toBe(72);
  });

  it('returns 60 for 4 character names', () => {
    expect(autoFontSize('ABCD')).toBe(60);
  });

  it('returns 56 for 5 character names', () => {
    expect(autoFontSize('ABCDE')).toBe(56);
  });

  it('returns 48 for 6 character names', () => {
    expect(autoFontSize('ABCDEF')).toBe(48);
  });

  it('returns 44 for 7 character names', () => {
    expect(autoFontSize('ABCDEFG')).toBe(44);
  });

  it('uses formula for 8+ character names with min of 32', () => {
    expect(autoFontSize('ABCDEFGH')).toBe(Math.max(32, Math.floor(320 / 8)));
    expect(autoFontSize('ABCDEFGHIJ')).toBe(Math.max(32, Math.floor(320 / 10)));
  });

  it('never returns less than 32', () => {
    const longName = 'A'.repeat(50);
    expect(autoFontSize(longName)).toBeGreaterThanOrEqual(32);
  });

  it('decreases as name length increases', () => {
    const sizes = [];
    for (let i = 1; i <= 10; i++) {
      sizes.push(autoFontSize('A'.repeat(i)));
    }
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1]);
    }
  });
});

describe('pillLayout', () => {
  it('returns SVG string with rect and text elements', () => {
    const svg = pillLayout('Test', 800);
    expect(svg).toContain('<rect');
    expect(svg).toContain('<text');
    expect(svg).toContain('Test');
  });

  it('uses auto font size when not specified', () => {
    const svg = pillLayout('AB', 800);
    expect(svg).toContain('font-size="80"');
  });

  it('uses custom font size when provided', () => {
    const svg = pillLayout('Test', 800, { fontSize: 50 });
    expect(svg).toContain('font-size="50"');
  });

  it('escapes special XML characters in name', () => {
    const svg = pillLayout('R&D', 800);
    expect(svg).toContain('R&amp;D');
    expect(svg).not.toContain('>R&D<');
  });

  it('includes text-anchor middle for centering', () => {
    const svg = pillLayout('Hello', 800);
    expect(svg).toContain('text-anchor="middle"');
  });

  it('includes rx for rounded corners', () => {
    const svg = pillLayout('Hello', 800);
    expect(svg).toContain('rx="');
  });
});

describe('overlayLayout', () => {
  it('returns SVG with text and filter', () => {
    const svg = overlayLayout('Test', 800);
    expect(svg).toContain('<text');
    expect(svg).toContain('<filter');
    expect(svg).toContain('feDropShadow');
  });

  it('uses larger font size than autoFontSize (1.3x)', () => {
    const svg = overlayLayout('AB', 800);
    // autoFontSize for 2 chars = 80, overlay multiplies by 1.3 = 104
    expect(svg).toContain('font-size="104"');
  });

  it('escapes special characters', () => {
    const svg = overlayLayout('A<B>', 800);
    expect(svg).toContain('A&lt;B&gt;');
  });
});

describe('verticalLayout', () => {
  it('returns SVG with one text element per character', () => {
    const svg = verticalLayout('ABC', 800);
    const textCount = (svg.match(/<text /g) || []).length;
    expect(textCount).toBe(3);
  });

  it('includes filter definitions', () => {
    const svg = verticalLayout('Hi', 800);
    expect(svg).toContain('<filter');
    expect(svg).toContain('v-shadow');
  });

  it('escapes each character individually', () => {
    const svg = verticalLayout('A&B', 800);
    expect(svg).toContain('&amp;');
  });
});

describe('artisticLayout', () => {
  it('returns SVG with one text element per character', () => {
    const rng = createRng('art');
    const svg = artisticLayout('ABCDE', 800, {}, rng);
    const textCount = (svg.match(/<text /g) || []).length;
    expect(textCount).toBe(5);
  });

  it('includes filter definitions', () => {
    const rng = createRng('art-filter');
    const svg = artisticLayout('Test', 800, {}, rng);
    expect(svg).toContain('<filter');
    expect(svg).toContain('a-shadow');
  });

  it('works without rng (uses fallback)', () => {
    const svg = artisticLayout('AB', 800);
    expect(svg).toContain('<text');
  });

  it('is deterministic with same seed', () => {
    const rng1 = createRng('det-art');
    const rng2 = createRng('det-art');
    const svg1 = artisticLayout('Test', 800, {}, rng1);
    const svg2 = artisticLayout('Test', 800, {}, rng2);
    expect(svg1).toBe(svg2);
  });
});

describe('layoutText', () => {
  it('routes to pill layout by default', () => {
    const svg = layoutText('pill', 'Test', 800);
    expect(svg).toContain('<rect');
    expect(svg).toContain('Test');
  });

  it('routes to overlay layout', () => {
    const svg = layoutText('overlay', 'Test', 800);
    expect(svg).toContain('feDropShadow');
  });

  it('routes to vertical layout', () => {
    const svg = layoutText('vertical', 'ABC', 800);
    const textCount = (svg.match(/<text /g) || []).length;
    expect(textCount).toBe(3);
  });

  it('routes to artistic layout', () => {
    const rng = createRng('layout');
    const svg = layoutText('artistic', 'ABC', 800, {}, rng);
    expect(svg).toContain('a-shadow');
  });

  it('defaults to pill for unknown style', () => {
    const svg = layoutText('unknown', 'Test', 800);
    expect(svg).toContain('<rect');
  });
});
