import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

/**
 * Workflows feature.
 */
export default defineFeatureContract({
  id: 'workflows',
  name: 'Workflows',
  collections: ["workflowDefinitions"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});
