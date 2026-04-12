/**
 * @file src/core/runtime/feature-loader.js
 * @description Runtime loader for installed features.
 */

/**
 * Load all installed features from the project features directory.
 *
 * @returns {Promise<Array<object>>}
 */
export async function loadFeatures() {
  const modules = import.meta.glob('../../features/*/index.js')
  const features = []

  for (const modulePath of Object.keys(modules)) {
    const mod = await modules[modulePath]()
    features.push(mod?.default || mod)
  }

  return features.filter(Boolean)
}
