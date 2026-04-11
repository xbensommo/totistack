/**
 * @file feature-validator.js
 * @description Validates feature manifests.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { validateFeatureManifest } from '../contracts/feature.contract.js';

export function validateFeature(manifest) {
  validateFeatureManifest(manifest);
  return true;
}