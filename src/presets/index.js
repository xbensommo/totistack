/**
 * @file index.js
 * @description Central export for all presets.
 * @date 2026-03-22
 * @author Totistack Team
 */

import businessCore from './business-core.preset.js';
import serviceBusiness from './service-business.preset.js';
import commerce from './commerce.preset.js';
import internalOps from './internal-ops.preset.js';
import crmSuite from './crm-suite.preset.js';

export const presets = {
  'business-core': businessCore,
  'service-business': serviceBusiness,
  'commerce': commerce,
  'internal-ops': internalOps,
  'crm-suite': crmSuite
};

export default presets;

/**
 * Get a preset by ID.
 * @param {string} id - Preset identifier
 * @returns {Object|null} Preset configuration or null if not found
 */
export function getPreset(id) {
  return presets[id] || null;
}

/**
 * Get all available presets.
 * @returns {Array} List of presets with id and name
 */
export function listPresets() {
  return Object.entries(presets).map(([id, preset]) => ({
    id,
    name: preset.name,
    description: preset.description,
    apps: preset.apps.length,
    features: preset.features.length
  }));
}