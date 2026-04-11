/**
 * @file index.js
 * @description Central export for registries.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { AppRegistry } from './app-registry.js';
import { FeatureRegistry } from './feature-registry.js';
import { PresetRegistry } from './preset-registry.js';
import { DocumentRegistry } from './document-registry.js';

export const appRegistry = new AppRegistry();
export const featureRegistry = new FeatureRegistry();
export const presetRegistry = new PresetRegistry();
export const documentRegistry = new DocumentRegistry();

export async function loadAllRegistries() {
  await Promise.all([
    appRegistry.load(),
    featureRegistry.load(),
    presetRegistry.load(),
    documentRegistry.load(),
  ]);
}