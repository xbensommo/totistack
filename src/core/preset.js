import { getPreset } from './registry.js';
import { resolveFeatures } from './resolver.js';

export async function resolvePreset(presetName) {
  const preset = await getPreset(presetName);

  if (!preset) {
    throw new Error(`Unknown preset: "${presetName}"`);
  }

  return {
    ...preset,
    resolvedFeatures: await resolveFeatures(preset.features || []),
  };
}