/** @file src/features/notifications/feature.manifest.js */

import routes from './routes.js'
import { NOTIFICATIONS_PERMISSIONS } from './permissions.js'

export const NOTIFICATIONS_FEATURE_ID = 'notifications'

/**
 * Totistack notifications feature.
 *
 * v2.2.13 keeps the newer Firestore/FCM transport model, but restores the older
 * product UX: bell, drawer, center, filters, preferences, templates, and logs.
 */
export const notificationsFeatureManifest = {
  id: NOTIFICATIONS_FEATURE_ID,
  type: 'feature',
  kind: 'feature',
  name: 'Notifications',
  version: '2.2.13',
  description: 'Unified notification center with Firestore inbox, delivery logs, preferences, templates, FCM web push, shell bell, and right-side drawer.',
  category: 'foundation',
  icon: 'fa-regular fa-bell',
  order: 58,
  routeBase: '/notifications',
  entry: {
    routeName: 'NotificationsCenter',
    view: 'NotificationCenterPage',
  },
  navigation: [
    {
      label: 'Notifications',
      to: '/notifications',
      icon: 'fa-regular fa-bell',
      order: 58,
      permission: NOTIFICATIONS_PERMISSIONS.VIEW,
    },
  ],
  shell: {
    topbarActions: [
      {
        id: 'notifications-bell',
        component: 'NotificationBell',
        order: 20,
      },
    ],
    drawers: [
      {
        id: 'notifications-drawer',
        component: 'NotificationDrawer',
        side: 'right',
      },
    ],
  },
  dependencies: {
    features: ['auth'],
    apps: [],
  },
  collections: [
    'notifications',
    'notificationPreferences',
    'notificationTokens',
    'notificationDeliveries',
    'notification_logs',
    'notification_templates',
    'notification_preferences',
  ],
  routes,
  permissions: Object.values(NOTIFICATIONS_PERMISSIONS),
  capabilities: {
    inbox: true,
    inApp: true,
    fcmPush: true,
    email: true,
    whatsapp: true,
    preferences: true,
    templates: true,
    deliveryLogs: true,
    retries: true,
    deepLinks: true,
    shellBell: true,
    drawer: true,
  },
}

export default notificationsFeatureManifest
