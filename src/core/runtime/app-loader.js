/**
 * @file src/core/runtime/app-loader.js
 * @description Runtime loader for installed apps.
 */

/**
 * Load all installed apps from the project apps directory.
 *
 * @returns {Promise<Array<object>>}
 */
export async function loadApps() {
  const modules = import.meta.glob('../../apps/*/index.js')
  const apps = []

  for (const modulePath of Object.keys(modules)) {
    const mod = await modules[modulePath]()
    apps.push(mod?.default || mod)
  }

  return apps.filter(Boolean)
}
