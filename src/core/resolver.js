import { getFeature } from './registry.js';

export async function resolveFeatures(inputFeatures = []) {
  const resolved = [];
  const visiting = new Set();
  const visited = new Set();

  async function visit(featureName, ancestry = []) {
    if (visited.has(featureName)) return;

    const feature = await getFeature(featureName);
    if (!feature) {
      throw new Error(`Unknown feature: "${featureName}"`);
    }

    if (visiting.has(featureName)) {
      const cycle = [...ancestry, featureName].join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    visiting.add(featureName);

    for (const dep of feature.dependencies || []) {
      await visit(dep, [...ancestry, featureName]);
    }

    visiting.delete(featureName);
    visited.add(featureName);

    if (!resolved.includes(featureName)) {
      resolved.push(featureName);
    }
  }

  for (const featureName of inputFeatures) {
    await visit(featureName);
  }

  await validateIncompatibilities(resolved);

  return resolved;
}

export async function validateIncompatibilities(featureNames) {
  for (const featureName of featureNames) {
    const feature = await getFeature(featureName);
    if (!feature) continue;

    for (const blocked of feature.incompatibleWith || []) {
      if (featureNames.includes(blocked)) {
        throw new Error(`Feature conflict: "${featureName}" is incompatible with "${blocked}"`);
      }
    }
  }
}