/**
 * @file registerModules.js
 * @description Dynamically loads installed apps from the apps directory.
 */

/**
 * Load all installed apps.
 *
 * @returns {Promise<Array>} Array of loaded app modules.
 */
export async function loadApps() {
  try {
    const modules = import.meta.glob('../../apps/*/index.js', { eager: false });
    const loadedApps = [];

    for (const [modulePath, importFn] of Object.entries(modules)) {
      try {
        const module = await importFn();
        const appConfig = module.default || module;

        if (!appConfig.id) {
          console.warn(`App ${modulePath} is missing the required "id" property`);
          continue;
        }

        loadedApps.push({
          ...appConfig,
          _path: modulePath,
        });
      } catch (error) {
        console.error(`Failed to load app ${modulePath}:`, error);
      }
    }

    return loadedApps;
  } catch (error) {
    console.error('Failed to load apps:', error);
    return [];
  }
}

/**
 * Load a single app module by ID.
 *
 * @param {string} appId - The app identifier.
 * @returns {Promise<Object|null>} The loaded app module or null if not found.
 */
export async function loadAppById(appId) {
  try {
    const module = await import(`../../apps/${appId}/index.js`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load app ${appId}:`, error);
    return null;
  }
}
