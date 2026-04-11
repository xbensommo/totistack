/**
 * @file project-config.contract.js
 * @description Contract for generated project configuration.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ValidationError } from '../errors/index.js';

/**
 * @typedef {object} ProjectConfigContract
 * @property {string} name - Project name.
 * @property {string} packageManager - 'npm', 'yarn', 'pnpm'.
 * @property {string} frontend - 'vue' or 'react'.
 * @property {object} branding - Branding tokens.
 * @property {string[]} apps - Enabled app IDs.
 * @property {string[]} features - Enabled feature IDs.
 * @property {object|null} firestore - Firestore configuration.
 */

/**
 * Validate a project configuration.
 * @param {unknown} config - Project configuration.
 * @returns {ProjectConfigContract} Validated config.
 * @throws {ValidationError}
 */
export function validateProjectConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('Project config must be an object');
  }
  if (!config.name || typeof config.name !== 'string') {
    throw new ValidationError('Project name is required');
  }
  if (!['npm', 'yarn', 'pnpm'].includes(config.packageManager)) {
    throw new ValidationError('Invalid package manager');
  }
  if (!['vue', 'react'].includes(config.frontend)) {
    throw new ValidationError('Invalid frontend framework');
  }
  return config;
}