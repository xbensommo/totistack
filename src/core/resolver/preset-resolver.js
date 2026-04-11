/**
 * @file preset-resolver.js
 * @description Expands a preset into its constituent apps and features.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ResolveError } from '../errors/index.js';

/**
 * Expand a preset ID into a list of app and feature IDs.
 * @param {string} presetId - Preset ID.
 * @param {PresetRegistry} presetRegistry - Preset registry.
 * @returns {{apps: string[], features: string[]}}
 * @throws {ResolveError}
 */
export function resolvePreset(presetId, presetRegistry) {
  const preset = presetRegistry.get(presetId);
  if (!preset) {
    throw new ResolveError(`Preset not found: ${presetId}`);
  }
  return {
    apps: preset.definition.apps,
    features: preset.definition.features,
  };
}