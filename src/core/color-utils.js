// @ts-check
import { parse, formatHex, interpolate, oklch } from 'culori';

/**
 * Convert a hex color string to OKLCH object.
 * @param {string} hex - e.g. '#FF5828'
 * @returns {{ l: number, c: number, h: number }} OKLCH values
 */
export function hexToOklch(hex) {
  const result = oklch(parse(hex));
  return {
    l: result?.l ?? 0,
    c: result?.c ?? 0,
    h: result?.h ?? 0,
  };
}

/**
 * Convert OKLCH values back to hex string.
 * @param {{ l: number, c: number, h: number }} color
 * @returns {string} hex color e.g. '#ff5828'
 */
export function oklchToHex(color) {
  return formatHex({ mode: 'oklch', l: color.l, c: color.c, h: color.h });
}

/**
 * Interpolate between two hex colors in OKLCH space.
 * Produces perceptually uniform transitions — no muddy middle tones.
 * @param {string} color1 - hex
 * @param {string} color2 - hex
 * @param {number} t - interpolation factor [0, 1]
 * @returns {string} hex result
 */
export function interpolateColors(color1, color2, t) {
  const fn = interpolate([color1, color2], 'oklch');
  return formatHex(fn(t));
}

/**
 * Generate an intermediate color between two hex colors in OKLCH space.
 * Useful for creating richer gradient stops.
 * @param {string} color1 - hex
 * @param {string} color2 - hex
 * @returns {string} hex midpoint color
 */
export function midpointColor(color1, color2) {
  return interpolateColors(color1, color2, 0.5);
}
