/**
 * @file app/stores/appStore/collection-actions.js
 * @description Central collection action registry for the root store.
 */

import { createShardedActions } from '@xbensommo/shard-provider';
import shardProvider from '@app/provider/shard-provider.js';
import { generatedCollectionNames } from '@generated/collections.js';

/**
 * Build collection action helpers from the generated collection registry.
 *
 * The canonical shape is an object keyed by collection name:
 * `collectionsActions[collectionName]`.
 *
 * A legacy shape is also exposed so older code using
 * `store.${collectionName}Actions` keeps working.
 *
 * @param {Record<string, any>} state
 * @returns {{
 *   byName: Record<string, any>,
 *   legacy: Record<string, any>,
 *   get: (collectionName: string) => any|null,
 *   require: (collectionName: string) => any,
 *   getState: (collectionName: string) => any|null,
 * }}
 */
export function createRootCollectionRegistry(state) {
  const byName = {};
  const legacy = {};

  generatedCollectionNames.forEach((collectionName) => {
    const actions = createShardedActions(collectionName, state, shardProvider);
    byName[collectionName] = actions;
    legacy[`${collectionName}Actions`] = actions;
  });

  const get = (collectionName) => byName[collectionName] || legacy[`${collectionName}Actions`] || null;

  const require = (collectionName) => {
    const actions = get(collectionName);
    if (!actions) {
      throw new Error(`[appStore] Missing generated collection actions for "${collectionName}".`);
    }
    return actions;
  };

  const getState = (collectionName) => state?.[collectionName] || null;

  return {
    byName,
    legacy,
    get,
    require,
    getState,
  };
}

export default createRootCollectionRegistry;
