import { createAppRuntime } from './createAppRuntime.js';
import { registerModules } from './registerModules.js';
import { registerRoutes } from './registerRoutes.js';
import { registerStores } from './registerStores.js';
import { registerProviders } from './registerProviders.js';

/**
 * Bootstraps a generated project runtime.
 * @param {Record<string, any>} manifest
 * @returns {Record<string, any>}
 */
export function bootstrapProject(manifest) {
  const runtime = createAppRuntime(manifest);
  registerModules(runtime, manifest);
  registerRoutes(runtime, manifest.routes || []);
  registerStores(runtime, manifest.stores || []);
  registerProviders(runtime, manifest.providers || []);
  runtime.ready = true;
  return runtime;
}
