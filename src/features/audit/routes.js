/** @file src/features/audit/routes.js */

import { AUDIT_PERMISSIONS } from './permissions.js'

export default [
  {
    path: '/audit',
    name: 'AuditLogs',
    component: () => import('./pages/AuditLogsPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'audit',
      permissions: [AUDIT_PERMISSIONS.VIEW],
    },
  },
]
