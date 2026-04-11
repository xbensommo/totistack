/**
 * @file plugin-loader.js
 * @description Loads and registers Vue plugins.
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Load plugins from modules.
 * @param {object} app - Vue app.
 * @param {Array} modules - Modules that export plugins.
 * @returns {Promise<void>}
 */
export async function loadPlugins(app, modules) {
  for (const mod of modules) {
    if (mod.install) {
      app.use(mod);
    }
  }
}