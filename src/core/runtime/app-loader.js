/**
 * @file app-loader.js
 * @description Runtime loader for installed apps.
 */

/**
 * Load all installed apps from the apps directory.
 *
 * @returns {Promise<Array>} List of app modules.
 */
export async function loadApps() {
  const modules = import.meta.glob('../apps/*/index.js');
  const apps = [];

  for (const modulePath in modules) {
    const mod = await modules[modulePath]();
    apps.push(mod.default || mod);
  }

  return apps;
}
