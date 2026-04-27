/** @file src/features/server-actions/routes.js */

import { SERVER_ACTIONS_PERMISSIONS } from './permissions.js'

export default [
  {
    path: '/server-actions',
    name: 'ServerActions',
    component: () => import('./pages/ServerActionsPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'server-actions',
      permissions: [SERVER_ACTIONS_PERMISSIONS.VIEW],
    },
  },
]
