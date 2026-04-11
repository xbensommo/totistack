import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

/**
 * Media feature.
 */
export default defineFeatureContract({
  id: 'media',
  name: 'Media',
  collections: ["mediaFiles"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});

