// @ts-check
import seedrandom from 'seedrandom';

/**
 * Create a seeded random number generator.
 * @param {string|number} seed
 * @returns {() => number} RNG function returning [0, 1)
 */
export function createRng(seed) {
  return seedrandom(String(seed));
}

/**
 * Pick a random element from an array.
 * @template T
 * @param {T[]} array
 * @param {() => number} rng
 * @returns {T}
 */
export function pickRandom(array, rng) {
  return array[Math.floor(rng() * array.length)];
}

/**
 * Generate a random float in [min, max).
 * @param {number} min
 * @param {number} max
 * @param {() => number} rng
 * @returns {number}
 */
export function randomRange(min, max, rng) {
  return min + rng() * (max - min);
}

/**
 * Simple string hash (djb2). Returns a stable numeric hash.
 * @param {string} str
 * @returns {number}
 */
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Escape special XML characters to prevent malformed SVG.
 * @param {string} str
 * @returns {string}
 */
export function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Clamp a number to [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
