/** @file src/features/audit/feature.manifest.js */

import routes from './routes.js'
import { AUDIT_PERMISSIONS } from './permissions.js'

export default {
  id: 'audit',
  type: 'feature',
  name: 'Audit',
  version: '1.0.0',
  description: 'Server-written audit logs and entity activity timeline for sensitive Totistack operations.',
  dependencies: {
    features: ['auth'],
    apps: [],
  },
  collections: ['auditLogs', 'entityActivity'],
  routes,
  permissions: Object.values(AUDIT_PERMISSIONS),
  capabilities: {
    auditLogs: true,
    entityActivity: true,
    serverWritten: true,
  },
}
