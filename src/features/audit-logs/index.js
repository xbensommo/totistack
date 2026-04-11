import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

/**
 * Audit Logs feature.
 */
export default defineFeatureContract({
  id: 'audit-logs',
  name: 'Audit Logs',
  collections: ["auditLogs"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});
