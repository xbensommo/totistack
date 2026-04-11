/**
 * @file feature.contract.js
 * @description Contract for feature modules (reusable capabilities).
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ValidationError } from '../errors/index.js';

/**
 * @typedef {object} FeatureContract
 * @property {string} id - Unique identifier (kebab-case).
 * @property {string} name - Human-readable name.
 * @property {string} [description] - Short description.
 * @property {boolean} [usesFirestore] - Whether feature uses Firestore.
 * @property {string} [provider] - Provider type (e.g., 'firestore').
 * @property {string[]} [dependencies] - NPM package dependencies.
 */

/**
 * Validate a feature manifest.
 * @param {unknown} manifest - Feature manifest to validate.
 * @returns {FeatureContract} Validated feature.
 * @throws {ValidationError}
 */
export function validateFeatureManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new ValidationError('Feature manifest must be an object');
  }
  if (!manifest.id || typeof manifest.id !== 'string') {
    throw new ValidationError('Feature manifest must have a string id');
  }
  if (!manifest.name || typeof manifest.name !== 'string') {
    throw new ValidationError('Feature manifest must have a string name');
  }
  return manifest;
}