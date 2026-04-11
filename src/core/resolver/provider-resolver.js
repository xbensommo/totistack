/**
 * @file provider-resolver.js
 * @description Determines which providers are needed based on selected apps/features.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ResolveError } from '../errors/index.js';

/**
 * Get the set of required providers.
 * @param {string[]} appIds - Selected app IDs.
 * @param {string[]} featureIds - Selected feature IDs.
 * @param {AppRegistry} appRegistry - App registry.
 * @param {FeatureRegistry} featureRegistry - Feature registry.
 * @returns {Set<string>} Set of provider names.
 */
export function resolveProviders(appIds, featureIds, appRegistry, featureRegistry) {
  const providers = new Set();
  for (const appId of appIds) {
    const app = appRegistry.get(appId);
    if (app && app.manifest.provider) {
      providers.add(app.manifest.provider);
    }
  }
  for (const featId of featureIds) {
    const feat = featureRegistry.get(featId);
    if (feat && feat.manifest.provider) {
      providers.add(feat.manifest.provider);
    }
  }
  return providers;
}