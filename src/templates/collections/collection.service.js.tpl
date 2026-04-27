/**
 * @file service.js
 * @description Root-store service layer for {{collectionName}} collection.
 * @date 2026-04-20
 * @author Totistack Team
 */

import { useAppStore } from '@app/stores/appStore';
import {
  getCollectionActions,
  getCollectionItems,
  normalizeError,
} from '@features/shared/featureToolkit.js';

/**
 * Resolve root-store collection actions for {{collectionName}}.
 *
 * @param {ReturnType<typeof useAppStore>} store
 * @returns {Record<string, Function>}
 */
function requireActions(store) {
  const actions = getCollectionActions(store, '{{collectionName}}');

  if (!actions || typeof actions !== 'object' || Object.keys(actions).length === 0) {
    throw new Error(
      '[{{collectionName}}] Missing generated collection actions on the root store. '
      + 'Collections must use the centralized root-store shard actions.'
    );
  }

  return actions;
}

/**
 * Build the default {{collectionName}} service.
 *
 * @param {ReturnType<typeof useAppStore>} [store]
 * @returns {{
 *   list: (params?: Record<string, any>) => Promise<any[]>,
 *   getById: (id: string, options?: Record<string, any>) => Promise<any>,
 *   create: (payload: Record<string, any>) => Promise<any>,
 *   update: (id: string, payload: Record<string, any>) => Promise<any>,
 *   remove: (id: string, options?: Record<string, any>) => Promise<any>,
 *   restore: (id: string, options?: Record<string, any>) => Promise<any>,
 * }}
 */
export function create{{componentName}}Service(store = useAppStore()) {
  const actions = requireActions(store);

  return {
    async list(params = {}) {
      try {
        await actions.fetchInitialPage(params);
        return getCollectionItems(store, '{{collectionName}}');
      } catch (error) {
        throw normalizeError(error, 'Failed to load {{collectionName}}.')
      }
    },

    async getById(id, options = {}) {
      try {
        if (!id) throw new Error('An item id is required.')
        return actions.getById(id, options.shardSource)
      } catch (error) {
        throw normalizeError(error, 'Failed to load {{collectionName}} item.')
      }
    },

    async create(payload = {}) {
      try {
        return actions.add(payload)
      } catch (error) {
        throw normalizeError(error, 'Failed to create {{collectionName}} item.')
      }
    },

    async update(id, payload = {}) {
      try {
        if (!id) throw new Error('An item id is required.')
        return actions.update(id, payload)
      } catch (error) {
        throw normalizeError(error, 'Failed to update {{collectionName}} item.')
      }
    },

    async remove(id, options = {}) {
      try {
        if (!id) throw new Error('An item id is required.')

        if (options.permanent && typeof actions.removePermanently === 'function') {
          return actions.removePermanently(id, options.shardSource)
        }

        if (typeof actions.remove === 'function') {
          return actions.remove(id, options.shardSource)
        }

        throw new Error('No remove action is available for {{collectionName}}.')
      } catch (error) {
        throw normalizeError(error, 'Failed to remove {{collectionName}} item.')
      }
    },

    async restore(id, options = {}) {
      try {
        if (!id) throw new Error('An item id is required.')

        if (typeof actions.restore === 'function') {
          return actions.restore(id, options.shardSource)
        }

        throw new Error('Restore is not available for {{collectionName}}.')
      } catch (error) {
        throw normalizeError(error, 'Failed to restore {{collectionName}} item.')
      }
    },
  }
}

const {{componentName}}Service = create{{componentName}}Service

export default {{componentName}}Service
