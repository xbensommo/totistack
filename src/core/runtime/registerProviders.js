/**
 * @file registerProviders.js
 * @description Registers providers with the Vue app
 * @date 2026-03-22
 * @author Totistack Team
 */

import { logger } from '../utils/logger.js';

/**
 * Register all providers with the app instance
 * @param {object} app - Vue app instance
 * @param {object} providers - Provider configurations
 * @returns {Promise<object>} Registered provider instances
 */
export async function registerProviders(app, providers = {}) {
  const registered = {};
  
  try {
    // Firebase provider
    if (providers.firebase && providers.firebase.config) {
      const { initializeApp } = await import('firebase/app');
      const firebaseApp = initializeApp(providers.firebase.config);
      registered.firebase = firebaseApp;
      app.provide('firebase', firebaseApp);
      logger.debug('Registered Firebase provider');
      
      // Firestore
      if (providers.firestore !== false) {
        const { getFirestore } = await import('firebase/firestore');
        const firestore = getFirestore(firebaseApp);
        registered.firestore = firestore;
        app.provide('firestore', firestore);
        logger.debug('Registered Firestore provider');
      }
      
      // Auth
      if (providers.auth !== false) {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth(firebaseApp);
        registered.auth = auth;
        app.provide('auth', auth);
        logger.debug('Registered Auth provider');
      }
      
      // Storage
      if (providers.storage !== false) {
        const { getStorage } = await import('firebase/storage');
        const storage = getStorage(firebaseApp);
        registered.storage = storage;
        app.provide('storage', storage);
        logger.debug('Registered Storage provider');
      }
    }
    
    // Shard Provider
    if (providers.shardProvider && registered.firestore) {
      try {
        const { createShardProvider } = await import('@xbensommo/shard-provider');
        const shardProvider = createShardProvider(registered.firestore, providers.shardProvider.options || {});
        registered.shardProvider = shardProvider;
        app.provide('shardProvider', shardProvider);
        logger.debug('Registered Shard Provider');
      } catch (error) {
        logger.warn('Failed to initialize shard-provider:', error.message);
      }
    }
    
    return registered;
  } catch (error) {
    logger.error('Failed to register providers:', error);
    throw error;
  }
}

/**
 * Register a single provider
 * @param {object} app - Vue app instance
 * @param {string} key - Provider key
 * @param {any} provider - Provider instance
 */
export function registerProvider(app, key, provider) {
  app.provide(key, provider);
}