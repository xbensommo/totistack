/**
 * @file index.js
 * @description Central export for all providers
 * @date 2026-03-22
 * @author Totistack Team
 */

import * as firestore from './firestore/index.js';

/**
 * Provider registry
 */
export const providers = {
  firestore
};

/**
 * Get a provider by name
 * @param {string} name - Provider name
 * @returns {object|null} Provider module
 */
export function getProvider(name) {
  return providers[name] || null;
}

/**
 * Initialize a provider
 * @param {string} name - Provider name
 * @param {object} config - Provider configuration
 * @returns {Promise<object>} Provider instance
 */
export async function initializeProvider(name, config) {
  const provider = getProvider(name);
  if (!provider) {
    throw new Error(`Provider not found: ${name}`);
  }
  
  if (provider.createFirestoreProvider) {
    return provider.createFirestoreProvider(config);
  }
  
  return provider;
}

export * from './firestore/index.js';