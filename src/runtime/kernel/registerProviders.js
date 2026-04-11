/**
 * @file registerProviders.js
 * @description Registers providers (Firebase, Firestore, etc.) with the app.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

/**
 * Provider configuration interface.
 * @typedef {Object} ProviderConfig
 * @property {Object} firebase - Firebase configuration
 * @property {string} firebase.apiKey - Firebase API key
 * @property {string} firebase.authDomain - Firebase auth domain
 * @property {string} firebase.projectId - Firebase project ID
 * @property {Object} [shardProvider] - Shard provider configuration
 */

/**
 * Register all providers with the Vue app.
 * @param {Object} app - Vue app instance
 * @param {ProviderConfig} config - Provider configuration
 * @returns {Promise<Object>} Provider instances
 */
export async function registerProviders(app, config) {
  const providers = {};
  
  try {
    // Initialize Firebase if config exists
    if (config.firebase && config.firebase.apiKey) {
      const firebaseApp = initializeApp(config.firebase);
      providers.firebase = firebaseApp;
      
      // Initialize Firestore
      if (config.firestore !== false) {
        const firestore = getFirestore(firebaseApp);
        providers.firestore = firestore;
        
        // Register Firestore with app
        app.provide('firestore', firestore);
      }
      
      // Initialize Auth
      if (config.auth !== false) {
        const auth = getAuth(firebaseApp);
        providers.auth = auth;
        app.provide('auth', auth);
      }
      
      // Initialize Storage
      if (config.storage !== false) {
        const storage = getStorage(firebaseApp);
        providers.storage = storage;
        app.provide('storage', storage);
      }
      
      // Register Firebase app instance
      app.provide('firebaseApp', firebaseApp);
    }
    
    // Initialize Shard Provider if configured
    if (config.shardProvider && providers.firestore) {
      try {
        const { createShardProvider } = await import('@xbensommo/shard-provider');
        const shardProvider = createShardProvider(providers.firestore, config.shardProvider);
        providers.shardProvider = shardProvider;
        app.provide('shardProvider', shardProvider);
      } catch (error) {
        console.warn('Failed to initialize shard-provider:', error);
      }
    }
    
    return providers;
  } catch (error) {
    console.error('Failed to register providers:', error);
    throw new Error(`Provider registration failed: ${error.message}`);
  }
}

/**
 * Register a custom provider with the app.
 * @param {Object} app - Vue app instance
 * @param {string} key - Provider key
 * @param {any} provider - Provider instance
 */
export function registerProvider(app, key, provider) {
  app.provide(key, provider);
}