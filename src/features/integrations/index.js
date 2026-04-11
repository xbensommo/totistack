import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

/**
 * Integrations feature.
 */
export default defineFeatureContract({
  id: 'integrations',
  name: 'Integrations',
  collections: ["integrationConnections"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});
