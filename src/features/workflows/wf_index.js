/**
 * Workflow Feature Entry Point
 * @module features/workflow
 * @description Main entry point for workflow automation feature
 * @author Totistack Team
 * @date 2026-03-22
 */

import { createPiniaStore } from './stores/workflowStore';
import workflowEngine from './services/workflowEngine';
import triggerService from './services/triggerService';
import actionService from './services/actionService';
import schedulerService from './services/schedulerService';

/**
 * Initialize the workflow feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Workflow Feature] Initializing...');
    
    // Validate dependencies
    if (!context.features?.auth || !context.features?.integration) {
      throw new Error('Workflow feature requires auth and integration features');
    }
    
    // Initialize Pinia store if available
    let workflowStore = null;
    if (context.pinia) {
      workflowStore = createPiniaStore(context.pinia);
      console.debug('[Workflow Feature] Pinia store registered');
    }
    
    // Initialize services
    await workflowEngine.initialize(config, context.features.auth, context.features.integration);
    await triggerService.initialize(config, workflowEngine);
    await actionService.initialize(config, context.features.integration);
    await schedulerService.initialize(config, workflowEngine);
    
    // Register webhook endpoints if HTTP server available
    if (context.httpServer) {
      context.httpServer.post('/webhooks/workflow/:triggerId', triggerService.handleWebhook);
    }
    
    // Start scheduler for timed triggers
    await schedulerService.start();
    
    console.info('[Workflow Feature] Initialized successfully');
    
    return {
      workflowEngine,
      triggerService,
      actionService,
      schedulerService,
      workflowStore
    };
    
  } catch (error) {
    console.error('[Workflow Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize workflow feature: ${error.message}`);
  }
}

export { workflowEngine, triggerService, actionService, schedulerService };
export default { initialize };