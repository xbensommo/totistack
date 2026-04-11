/**
 * @file naming.js
 * @description Naming conventions for files, components, etc.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { toPascalCase, toKebabCase, pluralize } from './text.js';

/**
 * Get the component name for a collection (PascalCase singular).
 * @param {string} collectionName - Collection name (e.g., 'bookings').
 * @returns {string}
 */
export function getComponentName(collectionName) {
  return toPascalCase(collectionName.replace(/s$/, ''));
}

/**
 * Get the route path for a collection (kebab-case plural).
 * @param {string} collectionName - Collection name.
 * @returns {string}
 */
export function getRoutePath(collectionName) {
  return `/${toKebabCase(collectionName)}`;
}

/**
 * Get the store module name for a collection (camelCase).
 * @param {string} collectionName - Collection name.
 * @returns {string}
 */
export function getStoreModuleName(collectionName) {
  return toKebabCase(collectionName).replace(/-/g, '_');
}