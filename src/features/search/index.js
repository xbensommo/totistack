import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

/**
 * Search feature.
 */
export default defineFeatureContract({
  id: 'search',
  name: 'Search',
  collections: ["searchIndexes"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});
