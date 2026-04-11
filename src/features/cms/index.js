/**
 * CMS Feature Entry Point
 * @module features/cms
 * @description Main entry point for Content Management System
 * @author Totistack Team
 * @date 2026-03-22
 */

import { createPiniaStore } from './stores/cmsStore';
import cmsService from './services/cmsService';
import pageBuilderService from './services/pageBuilderService';
import seoService from './services/seoService';
import contentTypeService from './services/contentTypeService';

/**
 * Initialize CMS feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[CMS Feature] Initializing...');
    
    // Validate dependencies
    if (!context.features?.auth || !context.features?.media) {
      throw new Error('CMS feature requires auth and media features');
    }
    
    // Initialize Pinia store
    let cmsStore = null;
    if (context.pinia) {
      cmsStore = createPiniaStore(context.pinia);
      console.debug('[CMS Feature] Pinia store registered');
    }
    
    // Initialize services
    await cmsService.initialize(config, context.features.auth, context.features.media);
    await pageBuilderService.initialize(config, cmsService);
    await seoService.initialize(config);
    await contentTypeService.initialize(config, cmsService);
    
    // Register dynamic routes for content pages
    if (context.router) {
      await cmsService.registerDynamicRoutes(context.router);
    }
    
    console.info('[CMS Feature] Initialized successfully');
    
    return {
      cmsService,
      pageBuilderService,
      seoService,
      contentTypeService,
      cmsStore
    };
    
  } catch (error) {
    console.error('[CMS Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize CMS feature: ${error.message}`);
  }
}

export { cmsService, pageBuilderService, seoService, contentTypeService };
export default { initialize };