/**
 * @file merge.js
 * @description Deep merge utility for objects.
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Deep merge two objects. Arrays are concatenated.
 * @param {object} target - Target object.
 * @param {object} source - Source object.
 * @returns {object} Merged object.
 */
export function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else if (Array.isArray(source[key])) {
        output[key] = [...(target[key] || []), ...source[key]];
      } else {
        output[key] = source[key];
      }
    }
  }
  return output;
}