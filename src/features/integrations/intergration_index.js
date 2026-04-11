/**
 * Integration Feature Entry Point
 * @module features/integration
 * @description Main entry point for third-party integrations feature
 * @author Totistack Team
 * @date 2026-03-22
 */

import integrationService from './services/integrationService';
import webhookService from './services/webhookService';
import oauthService from './services/oauthService';
import integrationStore from './stores/integrationStore';

/**
 * Initialize the integration feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Integration Feature] Initializing...');
    
    // Validate dependencies
    if (!context.features?.auth || !context.features?.rbac) {
      throw new Error('Integration feature requires auth and rbac features');
    }
    
    // Register store module
    if (context.store && !context.store.hasModule('integration')) {
      context.store.registerModule('integration', integrationStore);
    }
    
    // Initialize services
    await integrationService.initialize(config, context.features.auth, context.features.rbac);
    await webhookService.initialize(config);
    await oauthService.initialize(config, context.features.auth);
    
    console.info('[Integration Feature] Initialized successfully');
    
    return {
      integrationService,
      webhookService,
      oauthService
    };
    
  } catch (error) {
    console.error('[Integration Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize integration feature: ${error.message}`);
  }
}

export { integrationService, webhookService, oauthService };
export default { initialize };