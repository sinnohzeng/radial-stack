import { describe, it, expect } from 'vitest';
import {
  createRng,
  pickRandom,
  randomRange,
  hashString,
  escapeXml,
  clamp,
} from '../src/core/utils.js';

describe('createRng', () => {
  it('returns a function', () => {
    const rng = createRng('test');
    expect(typeof rng).toBe('function');
  });

  it('returns numbers in [0, 1)', () => {
    const rng = createRng('seed123');
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('produces deterministic output for same seed', () => {
    const rng1 = createRng('hello');
    const rng2 = createRng('hello');
    for (let i = 0; i < 20; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('produces different output for different seeds', () => {
    const rng1 = createRng('seed-a');
    const rng2 = createRng('seed-b');
    const vals1 = Array.from({ length: 5 }, () => rng1());
    const vals2 = Array.from({ length: 5 }, () => rng2());
    expect(vals1).not.toEqual(vals2);
  });

  it('accepts numeric seeds', () => {
    const rng = createRng(42);
    expect(typeof rng()).toBe('number');
  });
});

describe('pickRandom', () => {
  it('returns an element from the array', () => {
    const rng = createRng('pick');
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(pickRandom(arr, rng));
    }
  });

  it('returns the only element of a single-element array', () => {
    const rng = createRng('single');
    expect(pickRandom([42], rng)).toBe(42);
  });

  it('is deterministic with same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rng1 = createRng('deterministic');
    const rng2 = createRng('deterministic');
    for (let i = 0; i < 10; i++) {
      expect(pickRandom(arr, rng1)).toBe(pickRandom(arr, rng2));
    }
  });
});

describe('randomRange', () => {
  it('returns values within [min, max)', () => {
    const rng = createRng('range');
    for (let i = 0; i < 100; i++) {
      const val = randomRange(10, 20, rng);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThan(20);
    }
  });

  it('handles negative ranges', () => {
    const rng = createRng('neg');
    for (let i = 0; i < 50; i++) {
      const val = randomRange(-100, -50, rng);
      expect(val).toBeGreaterThanOrEqual(-100);
      expect(val).toBeLessThan(-50);
    }
  });

  it('returns min when range is zero', () => {
    const rng = createRng('zero');
    expect(randomRange(5, 5, rng)).toBe(5);
  });
});

describe('hashString', () => {
  it('returns a non-negative number', () => {
    expect(hashString('test')).toBeGreaterThanOrEqual(0);
  });

  it('returns same hash for same input', () => {
    expect(hashString('hello')).toBe(hashString('hello'));
  });

  it('returns different hashes for different inputs', () => {
    expect(hashString('abc')).not.toBe(hashString('xyz'));
  });

  it('handles empty string', () => {
    const h = hashString('');
    expect(typeof h).toBe('number');
    expect(h).toBeGreaterThanOrEqual(0);
  });

  it('handles unicode characters', () => {
    const h = hashString('测试部门');
    expect(typeof h).toBe('number');
    expect(h).toBeGreaterThanOrEqual(0);
  });
});

describe('escapeXml', () => {
  it('escapes ampersand', () => {
    expect(escapeXml('A&B')).toBe('A&amp;B');
  });

  it('escapes less-than', () => {
    expect(escapeXml('a<b')).toBe('a&lt;b');
  });

  it('escapes greater-than', () => {
    expect(escapeXml('a>b')).toBe('a&gt;b');
  });

  it('escapes double quotes', () => {
    expect(escapeXml('a"b')).toBe('a&quot;b');
  });

  it('escapes single quotes', () => {
    expect(escapeXml("a'b")).toBe('a&apos;b');
  });

  it('escapes all special characters together', () => {
    expect(escapeXml('R&D <"test"> \'ok\'')).toBe(
      'R&amp;D &lt;&quot;test&quot;&gt; &apos;ok&apos;',
    );
  });

  it('returns unchanged string when no special characters', () => {
    expect(escapeXml('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(escapeXml('')).toBe('');
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when below', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when above', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});
