/**
 * CRM App Entry Point
 * @file index.js
 * @module apps/crm
 * @description Complete CRM system entry point
 * @author Totistack Team
 * @date 2026-03-22
 */

import { createPiniaStore } from './stores/crmStore';
import crmService from './services/crmService';
import salesPipelineService from './services/salesPipelineService';
import activityService from './services/activityService';
import leadScoringService from './services/leadScoringService';

/**
 * Initialize CRM app
 * @param {Object} context - Application context
 * @param {Object} config - App configuration
 * @returns {Promise<Object>} Initialized app API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[CRM App] Initializing...');
    
    // Validate dependencies
    if (!context.features?.auth || !context.features?.rbac || 
        !context.features?.workflow || !context.features?.search) {
      throw new Error('CRM requires auth, rbac, workflow, and search features');
    }
    
    // Initialize Pinia store
    let crmStore = null;
    if (context.pinia) {
      crmStore = createPiniaStore(context.pinia);
      console.debug('[CRM App] Pinia store registered');
    }
    
    // Initialize services
    await crmService.initialize(config, context.features);
    await salesPipelineService.initialize(config, crmService);
    await activityService.initialize(config, crmService);
    await leadScoringService.initialize(config, crmService);
    
    // Register routes
    if (context.router) {
      const routes = (await import('./routes')).default;
      routes.forEach(route => context.router.addRoute(route));
    }
    
    console.info('[CRM App] Initialized successfully');
    
    return {
      crmService,
      salesPipelineService,
      activityService,
      leadScoringService,
      crmStore
    };
    
  } catch (error) {
    console.error('[CRM App] Initialization failed:', error);
    throw new Error(`Failed to initialize CRM app: ${error.message}`);
  }
}

export default { initialize };