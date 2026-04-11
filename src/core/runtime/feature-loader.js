/**
 * @file feature-loader.js
 * @description Runtime loader for features.
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Load all features.
 * @returns {Promise<Array>}
 */
export async function loadFeatures() {
  const modules = import.meta.glob('../features/*/index.js');
  const features = [];
  for (const path in modules) {
    const mod = await modules[path]();
    features.push(mod.default);
  }
  return features;
}