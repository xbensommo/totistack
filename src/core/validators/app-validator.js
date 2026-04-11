/**
 * @file app-validator.js
 * @description Validates app manifests.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { validateAppManifest } from '../contracts/app.contract.js';

/**
 * Validate an app manifest.
 * @param {unknown} manifest - App manifest.
 * @returns {boolean} True if valid.
 * @throws {ValidationError}
 */
export function validateApp(manifest) {
  validateAppManifest(manifest);
  return true;
}