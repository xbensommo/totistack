/**
 * @file collection-resolver.js
 * @description Resolves collections from selected apps.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ResolveError } from '../errors/index.js';
import { logger } from '../utils/index.js';

/**
 * Get all collections defined by selected apps.
 * @param {string[]} appIds - Selected app IDs.
 * @param {AppRegistry} appRegistry - App registry.
 * @returns {Array<{appId: string, collectionName: string, definition: object}>}
 * @throws {ResolveError}
 */
export function resolveCollections(appIds, appRegistry) {
  const collections = [];
  for (const appId of appIds) {
    const app = appRegistry.get(appId);
    if (!app) throw new ResolveError(`App not found: ${appId}`);
    const collectionNames = app.manifest.collections || [];
    for (const name of collectionNames) {
      // Ideally, each collection would have its own definition file.
      // For now, we'll create a placeholder definition.
      const definition = {
        name,
        provider: app.manifest.provider || 'firestore',
        // Additional metadata could be loaded from a file
      };
      collections.push({
        appId,
        collectionName: name,
        definition,
      });
      logger.debug(`Resolved collection ${name} from app ${appId}`);
    }
  }
  return collections;
}