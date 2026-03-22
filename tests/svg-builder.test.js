import { describe, it, expect } from 'vitest';
import { buildSVG } from '../src/core/svg-builder.js';

describe('buildSVG', () => {
  it('produces a valid SVG string', () => {
    const svg = buildSVG({ name: 'Test' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('includes width and height attributes', () => {
    const svg = buildSVG({ name: 'Test', size: 800 });
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="800"');
  });

  it('uses custom size', () => {
    const svg = buildSVG({ name: 'Test', size: 400 });
    expect(svg).toContain('width="400"');
    expect(svg).toContain('height="400"');
    expect(svg).toContain('viewBox="0 0 400 400"');
  });

  it('includes gradient definitions', () => {
    const svg = buildSVG({ name: 'Test' });
    expect(svg).toContain('<radialGradient');
    expect(svg).toContain('<style>');
  });

  it('includes background rect', () => {
    const svg = buildSVG({ name: 'Test' });
    expect(svg).toContain('id="bg"');
  });

  it('includes text element with name', () => {
    const svg = buildSVG({ name: 'Hello' });
    expect(svg).toContain('Hello');
  });

  it('applies saturation filter in style', () => {
    const svg = buildSVG({ name: 'Test', saturation: 150 });
    expect(svg).toContain('saturate(150%)');
  });

  it('defaults to 130% saturation', () => {
    const svg = buildSVG({ name: 'Test' });
    expect(svg).toContain('saturate(130%)');
  });

  describe('XML escaping with special characters', () => {
    it('escapes ampersand in name', () => {
      const svg = buildSVG({ name: 'R&D' });
      expect(svg).toContain('R&amp;D');
      // Should still be valid (no raw & in text)
      expect(svg).not.toMatch(/>R&D</);
    });

    it('escapes less-than and greater-than', () => {
      const svg = buildSVG({ name: '<Team>' });
      expect(svg).toContain('&lt;Team&gt;');
    });

    it('escapes quotes', () => {
      const svg = buildSVG({ name: 'Say "Hi"' });
      expect(svg).toContain('&quot;');
    });

    it('escapes single quotes', () => {
      const svg = buildSVG({ name: "It's" });
      expect(svg).toContain('&apos;');
    });

    it('handles all special characters together', () => {
      const svg = buildSVG({ name: 'A&B<C>"D\'E' });
      expect(svg).toContain('&amp;');
      expect(svg).toContain('&lt;');
      expect(svg).toContain('&gt;');
      expect(svg).toContain('&quot;');
      expect(svg).toContain('&apos;');
    });
  });

  describe('different palettes produce different outputs', () => {
    it('warm and cool produce different SVGs', () => {
      const warm = buildSVG({ name: 'Test', palette: 'warm', seed: 'same' });
      const cool = buildSVG({ name: 'Test', palette: 'cool', seed: 'same' });
      expect(warm).not.toBe(cool);
    });

    it('all 8 palettes produce unique outputs', () => {
      const palettes = ['warm', 'cool', 'sunset', 'forest', 'ocean', 'creative', 'tech', 'elegant'];
      const outputs = palettes.map((p) => buildSVG({ name: 'Test', palette: p, seed: 'fixed' }));
      const unique = new Set(outputs);
      expect(unique.size).toBe(8);
    });
  });

  describe('text styles', () => {
    it('pill style includes rect element', () => {
      const svg = buildSVG({ name: 'Test', textStyle: 'pill' });
      expect(svg).toContain('<rect');
      expect(svg).toContain('rx="');
    });

    it('overlay style includes drop shadow filter', () => {
      const svg = buildSVG({ name: 'Test', textStyle: 'overlay' });
      expect(svg).toContain('feDropShadow');
    });

    it('vertical style produces per-character text elements', () => {
      const svg = buildSVG({ name: 'ABC', textStyle: 'vertical' });
      // 3 characters + potentially other text elements, but at least 3 from vertical
      const textElements = svg.match(/<text /g) || [];
      expect(textElements.length).toBeGreaterThanOrEqual(3);
    });

    it('artistic style includes a-shadow filter', () => {
      const svg = buildSVG({ name: 'Test', textStyle: 'artistic' });
      expect(svg).toContain('a-shadow');
    });
  });

  describe('optional features', () => {
    it('includes blur filter when blur > 0', () => {
      const svg = buildSVG({ name: 'Test', blur: 5 });
      expect(svg).toContain('feGaussianBlur');
      expect(svg).toContain('stdDeviation="5"');
    });

    it('includes noise filter when noise is true', () => {
      const svg = buildSVG({ name: 'Test', noise: true });
      expect(svg).toContain('feTurbulence');
    });

    it('includes blend mode when specified', () => {
      const svg = buildSVG({ name: 'Test', blendMode: 'multiply' });
      expect(svg).toContain('mix-blend-mode:multiply');
    });

    it('includes border decoration', () => {
      const svg = buildSVG({ name: 'Test', decorations: { border: true } });
      expect(svg).toContain('stroke=');
    });

    it('includes corner badge', () => {
      const svg = buildSVG({ name: 'Test', decorations: { cornerBadge: '01' } });
      expect(svg).toContain('01');
    });

    it('custom font size overrides auto', () => {
      const svg = buildSVG({ name: 'Test', fontSize: 99 });
      expect(svg).toContain('font-size="99"');
    });
  });

  describe('custom palette (array)', () => {
    it('accepts custom color arrays', () => {
      const svg = buildSVG({ name: 'Test', palette: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'] });
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});
