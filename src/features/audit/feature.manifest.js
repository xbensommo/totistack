/** @file src/features/audit/feature.manifest.js */

import routes from './routes.js'
import { AUDIT_PERMISSIONS } from './permissions.js'

export default {
  id: 'audit',
  type: 'feature',
  name: 'Audit Evidence',
  version: '2.2.13',
  description: 'Append-only audit logs and entity activity timeline for sensitive Totistack operations.',
  dependencies: { features: ['auth'], apps: [] },
  collections: ['auditLogs', 'entityActivity'],
  routes,
  permissions: Object.values(AUDIT_PERMISSIONS),
  capabilities: {
    auditLogs: true,
    entityActivity: true,
    serverWritten: true,
    reviewWorkflow: true,
    soc2Evidence: true,
  },
}
