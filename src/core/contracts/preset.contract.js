/**
 * @file preset.contract.js
 * @description Contract for presets (predefined app/feature bundles).
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ValidationError } from '../errors/index.js';

/**
 * @typedef {object} PresetContract
 * @property {string} id - Unique identifier (kebab-case).
 * @property {string} name - Human-readable name.
 * @property {string} [description] - Description.
 * @property {string[]} apps - List of app IDs to include.
 * @property {string[]} features - List of feature IDs to include.
 */

/**
 * Validate a preset definition.
 * @param {unknown} preset - Preset definition.
 * @returns {PresetContract} Validated preset.
 * @throws {ValidationError}
 */
export function validatePreset(preset) {
  if (!preset || typeof preset !== 'object') {
    throw new ValidationError('Preset must be an object');
  }
  if (!preset.id || typeof preset.id !== 'string') {
    throw new ValidationError('Preset must have a string id');
  }
  if (!preset.name || typeof preset.name !== 'string') {
    throw new ValidationError('Preset must have a string name');
  }
  if (!Array.isArray(preset.apps)) {
    throw new ValidationError('Preset apps must be an array');
  }
  if (!Array.isArray(preset.features)) {
    throw new ValidationError('Preset features must be an array');
  }
  return preset;
}