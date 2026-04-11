import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

/**
 * Analytics feature.
 */
export default defineFeatureContract({
  id: 'analytics',
  name: 'Analytics',
  collections: ["analyticsEvents"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});
