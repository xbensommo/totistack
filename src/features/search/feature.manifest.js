/**
 * @file search/feature.manifest.js
 * @description Declarative manifest for the Totistack search feature.
 */
export default {
  id: 'search',
  type: 'feature',
  name: 'Search',
  version: '3.0.0',
  description: 'Search index metadata, query logging, synonyms, and a starter search console.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: [],
  },
  collections: ['searchIndexes', 'searchQueries', 'searchSynonyms'],
  services: ['searchService'],
  routes: ['./routes.js'],
}
