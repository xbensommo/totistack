/**
 * @file text.js
 * @description String manipulation utilities (casing, pluralization, etc.).
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Convert a string to camelCase.
 * @param {string} str - Input string.
 * @returns {string}
 */
export function toCamelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
}

/**
 * Convert a string to PascalCase.
 * @param {string} str - Input string.
 * @returns {string}
 */
export function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Convert a string to kebab-case.
 * @param {string} str - Input string.
 * @returns {string}
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert a string to snake_case.
 * @param {string} str - Input string.
 * @returns {string}
 */
export function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Pluralize a word (simple implementation).
 * @param {string} word - Singular word.
 * @returns {string}
 */
export function pluralize(word) {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}