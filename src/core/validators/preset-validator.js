/**
 * @file preset-validator.js
 * @description Validates presets.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { validatePreset } from '../contracts/preset.contract.js';

export function validatePresetDefinition(preset) {
  validatePreset(preset);
  return true;
}