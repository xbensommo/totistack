/**
 * @file registerStores.js
 * @description Registers Pinia stores with the app
 * @date 2026-03-22
 * @author Totistack Team
 */

import { logger } from '../utils/logger.js';

/**
 * Register stores from modules with Pinia
 * @param {object} pinia - Pinia instance
 * @param {Array} modules - Modules with stores
 * @returns {Promise<object>} Registered store instances
 */
export async function registerStores(pinia, modules = []) {
  const stores = {};
  
  try {
    for (const module of modules) {
      if (module.store && typeof module.store === 'function') {
        const store = module.store(pinia);
        stores[module.id] = store;
        logger.debug(`Registered store: ${module.id}`);
      }
      
      if (module.stores && typeof module.stores === 'object') {
        for (const [name, storeFn] of Object.entries(module.stores)) {
          const store = storeFn(pinia);
          stores[`${module.id}_${name}`] = store;
          logger.debug(`Registered store: ${module.id}_${name}`);
        }
      }
    }
    
    logger.info(`Registered ${Object.keys(stores).length} stores`);
    return stores;
  } catch (error) {
    logger.error('Failed to register stores:', error);
    throw error;
  }
}

/**
 * Register a single store
 * @param {object} pinia - Pinia instance
 * @param {string} id - Store ID
 * @param {Function} storeFn - Store factory function
 * @returns {any} Store instance
 */
export function registerStore(pinia, id, storeFn) {
  const store = storeFn(pinia);
  logger.debug(`Registered store: ${id}`);
  return store;
}