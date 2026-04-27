/** @file src/features/notifications/routes.js */

import { NOTIFICATIONS_PERMISSIONS } from './permissions.js'

export default [
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('./pages/NotificationsPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'notifications',
      permissions: [NOTIFICATIONS_PERMISSIONS.VIEW],
    },
  },
  {
    path: '/notifications/deliveries',
    name: 'NotificationDeliveries',
    component: () => import('./pages/NotificationDeliveriesPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'notifications',
      permissions: [NOTIFICATIONS_PERMISSIONS.DELIVERIES],
    },
  },
]
