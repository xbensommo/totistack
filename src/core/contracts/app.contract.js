/**
 * @file app.contract.js
 * @description Contract for app modules (business apps).
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ValidationError } from '../errors/index.js';

/**
 * @typedef {object} AppContract
 * @property {string} id - Unique identifier (kebab-case).
 * @property {string} name - Human-readable name.
 * @property {string} [description] - Short description.
 * @property {boolean} [usesFirestore] - Whether app uses Firestore.
 * @property {string} [provider] - Provider type (e.g., 'firestore').
 * @property {string[]} [features] - Required feature IDs.
 * @property {string[]} [collections] - Collection names defined by this app.
 * @property {boolean} [routes] - Whether app adds routes.
 * @property {boolean} [stores] - Whether app adds Pinia stores.
 * @property {boolean} [pages] - Whether app has pages.
 * @property {string[]} [dependencies] - NPM package dependencies.
 */

/**
 * Validate an app manifest.
 * @param {unknown} manifest - App manifest to validate.
 * @returns {AppContract} Validated app.
 * @throws {ValidationError}
 */
export function validateAppManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new ValidationError('App manifest must be an object');
  }
  if (!manifest.id || typeof manifest.id !== 'string') {
    throw new ValidationError('App manifest must have a string id');
  }
  if (!manifest.name || typeof manifest.name !== 'string') {
    throw new ValidationError('App manifest must have a string name');
  }
  // Additional validations can be added
  return manifest;
}