/**
 * @file runtime-kernel.js
 * @description Kernel that bootstraps the application.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { loadApps } from './app-loader.js';
import { loadFeatures } from './feature-loader.js';
import { registerRoutes } from './registerRoutes.js';
import { registerStores } from './registerStores.js';

/**
 * Bootstrap the application.
 * @param {object} app - Vue app instance.
 * @returns {Promise<void>}
 */
export async function bootstrapApp(app) {
  const apps = await loadApps();
  const features = await loadFeatures();

  // Register routes
  await registerRoutes(app, apps, features);

  // Register stores
  await registerStores(app, apps, features);

  // Additional bootstrapping...
}