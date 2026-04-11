/**
 * @file createAppRuntime.js
 * @description Creates the main application runtime instance with all modules registered.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { loadApps } from './registerModules.js';
import { loadFeatures } from './registerFeatures.js';
import { registerProviders } from './registerProviders.js';
import { bootSequence } from './bootSequence.js';

/**
 * Configuration options for the app runtime.
 * @typedef {Object} AppRuntimeOptions
 * @property {Object} [providers] - Provider configurations (Firebase, Firestore, etc.)
 * @property {Object} [router] - Router configuration overrides
 * @property {Object} [stores] - Store configuration
 */

/**
 * Creates and configures the Vue application runtime.
 * @param {string} rootComponent - Path or component to use as root
 * @param {AppRuntimeOptions} options - Runtime options
 * @returns {Promise<Object>} The configured app instance
 */
export async function createAppRuntime(rootComponent, options = {}) {
  try {
    // Create base app instance
    const app = createApp(rootComponent);
    
    // Initialize Pinia store
    const pinia = createPinia();
    app.use(pinia);
    
    // Initialize router
    const router = createRouter({
      history: createWebHistory(),
      routes: [], // Will be populated by modules
    });
    app.use(router);
    
    // Register all modules
    const apps = await loadApps();
    const features = await loadFeatures();
    
    // Register providers (Firebase, Firestore, etc.)
    await registerProviders(app, options.providers || {});
    
    // Register module routes and stores
    for (const feature of features) {
      if (feature.routes) {
        feature.routes.forEach(route => router.addRoute(route));
      }
      if (feature.store) {
        pinia.use(feature.store);
      }
      if (feature.install) {
        app.use(feature);
      }
    }
    
    for (const appModule of apps) {
      if (appModule.routes) {
        appModule.routes.forEach(route => router.addRoute(route));
      }
      if (appModule.store) {
        pinia.use(appModule.store);
      }
      if (appModule.install) {
        app.use(appModule);
      }
    }
    
    // Execute boot sequence
    await bootSequence(app, { apps, features });
    
    return { app, router, pinia };
  } catch (error) {
    console.error('Failed to create app runtime:', error);
    throw new Error(`Runtime initialization failed: ${error.message}`);
  }
}