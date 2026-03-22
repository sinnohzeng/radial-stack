/**
 * Creates a debounced version of a function.
 * @param {Function} fn - Function to debounce
 * @param {number} [ms=200] - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, ms = 200) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}
