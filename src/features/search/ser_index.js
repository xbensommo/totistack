/**
 * Search Feature Entry Point
 * @module features/search
 * @description Main entry point for search engine feature
 * @author Totistack Team
 * @date 2026-03-22
 */

import { createPiniaStore } from './stores/searchStore';
import searchEngine from './services/searchEngine';
import indexService from './services/indexService';
import queryParser from './services/queryParser';
import rankingService from './services/rankingService';

/**
 * Initialize the search feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Search Feature] Initializing...');
    
    // Validate dependencies
    if (!context.features?.auth) {
      throw new Error('Search feature requires auth feature');
    }
    
    // Initialize Pinia store if available
    let searchStore = null;
    if (context.pinia) {
      searchStore = createPiniaStore(context.pinia);
      console.debug('[Search Feature] Pinia store registered');
    }
    
    // Initialize services
    await searchEngine.initialize(config, context.features.auth);
    await indexService.initialize(config, searchEngine);
    await queryParser.initialize(config);
    await rankingService.initialize(config);
    
    console.info('[Search Feature] Initialized successfully');
    
    return {
      searchEngine,
      indexService,
      queryParser,
      rankingService,
      searchStore
    };
    
  } catch (error) {
    console.error('[Search Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize search feature: ${error.message}`);
  }
}

export { searchEngine, indexService, queryParser, rankingService };
export default { initialize };
