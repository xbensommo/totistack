/**
 * Search Engine Feature Manifest
 * @module features/search
 * @description Advanced search engine with full-text search, faceting, and indexing
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'search',
  name: 'Search Engine',
  version: '2.0.0',
  description: 'Advanced search with full-text indexing, faceted search, and relevance scoring',
  
  dependencies: {
    features: ['auth', 'rbac'],
    apps: []
  },
  
  configSchema: {
    type: 'object',
    properties: {
      defaultSearchLimit: { type: 'number', default: 20 },
      maxSearchLimit: { type: 'number', default: 100 },
      enableFuzzySearch: { type: 'boolean', default: true },
      fuzzyThreshold: { type: 'number', default: 0.6 },
      indexBatchSize: { type: 'number', default: 100 },
      enableAnalytics: { type: 'boolean', default: true },
      searchCacheTtl: { type: 'number', default: 300 }
    }
  },
  
  collections: [
    'searchIndex',
    'searchQueries',
    'searchSynonyms',
    'searchStopWords'
  ],
  
  services: ['searchEngine', 'indexService', 'queryParser', 'rankingService'],
  
  stores: ['search'],
  
  hooks: ['onSearch', 'onIndexUpdate', 'onSynonymAdded']
};
