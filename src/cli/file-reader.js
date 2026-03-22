// @ts-check
import { readFileSync } from 'fs';
import { extname } from 'path';

/**
 * @typedef {Object} DepartmentEntry
 * @property {string} name
 * @property {string} [color_hint]
 * @property {string|number} [seed]
 */

/**
 * Read and parse an input file (JSON, TXT, or CSV).
 * Autodetects format based on extension, with content sniffing fallback.
 *
 * @param {string} filePath
 * @returns {DepartmentEntry[]}
 */
export function readInput(filePath) {
  const content = readFileSync(filePath, 'utf-8').trim();
  if (!content) {
    throw new Error(`Input file is empty: ${filePath}`);
  }

  const ext = extname(filePath).toLowerCase();

  switch (ext) {
    case '.json':
      return parseJSON(content, filePath);
    case '.csv':
      return parseCSV(content);
    case '.txt':
      return parseTXT(content);
    default:
      // Content sniffing
      if (content.startsWith('[') || content.startsWith('{')) {
        return parseJSON(content, filePath);
      }
      if (content.includes(',')) {
        return parseCSV(content);
      }
      return parseTXT(content);
  }
}

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {DepartmentEntry[]}
 */
function parseJSON(content, filePath) {
  let data;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error(`Invalid JSON in ${filePath}`);
  }

  if (!Array.isArray(data)) {
    throw new Error(`JSON must be an array of department entries`);
  }

  return data.map((entry, i) => {
    if (typeof entry === 'string') {
      return { name: entry };
    }
    if (!entry.name || typeof entry.name !== 'string') {
      throw new Error(`Entry ${i} missing "name" field`);
    }
    return entry;
  });
}

/**
 * @param {string} content
 * @returns {DepartmentEntry[]}
 */
function parseTXT(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((name) => ({ name }));
}

/**
 * @param {string} content
 * @returns {DepartmentEntry[]}
 */
function parseCSV(content) {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Skip header if it looks like one
  const firstLine = lines[0].toLowerCase();
  const startIndex = firstLine.includes('name') || firstLine.includes('部门') ? 1 : 0;

  return lines.slice(startIndex).map((line) => {
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
    const entry = { name: parts[0] };
    if (parts[1]) entry.color_hint = parts[1];
    return entry;
  });
}
