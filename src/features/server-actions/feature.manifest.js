/** @file src/features/server-actions/feature.manifest.js */

import routes from './routes.js'
import { SERVER_ACTIONS_PERMISSIONS } from './permissions.js'

export default {
  id: 'server-actions',
  type: 'feature',
  name: 'Server Actions',
  version: '1.0.0',
  description: 'Developer-declared trusted operation layer for Totistack. Ordinary CRUD remains on shard-provider actions.',
  dependencies: {
    features: ['auth', 'notifications', 'audit'],
    apps: [],
  },
  collections: ['actionRequests'],
  routes,
  permissions: Object.values(SERVER_ACTIONS_PERMISSIONS),
  capabilities: {
    callableExecution: true,
    idempotency: true,
    audit: true,
    notifications: true,
  },
}
