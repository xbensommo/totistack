/**
 * Analytics Feature Entry Point
 * @module features/analytics
 * @description Main entry point for analytics feature
 * @author Totistack Team
 * @date 2026-03-22
 */

import analyticsService from './services/analyticsService';
import eventTracker from './services/eventTracker';
import performanceTracker from './services/performanceTracker';
import analyticsStore from './stores/analyticsStore';

/**
 * Initialize the analytics feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Analytics Feature] Initializing...');
    
    // Register store module
    if (context.store && !context.store.hasModule('analytics')) {
      context.store.registerModule('analytics', analyticsStore);
    }
    
    // Initialize services
    await analyticsService.initialize(config, context.features?.auth);
    await eventTracker.initialize(config, analyticsService);
    await performanceTracker.initialize(config, analyticsService);
    
    // Set up automatic page view tracking
    if (context.router) {
      context.router.afterEach((to, from) => {
        if (analyticsService.isEnabled()) {
          analyticsService.trackPageView({
            path: to.fullPath,
            name: to.name,
            query: to.query,
            params: to.params,
            referrer: from.fullPath
          });
        }
      });
      console.debug('[Analytics Feature] Page view tracking enabled');
    }
    
    // Track initial page load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        analyticsService.trackPageView({
          path: window.location.pathname,
          name: 'initial_load',
          isInitial: true
        });
      });
    }
    
    console.info('[Analytics Feature] Initialized successfully');
    
    return {
      analyticsService,
      eventTracker,
      performanceTracker
    };
    
  } catch (error) {
    console.error('[Analytics Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize analytics feature: ${error.message}`);
  }
}

export { analyticsService, eventTracker, performanceTracker };
export default { initialize };
