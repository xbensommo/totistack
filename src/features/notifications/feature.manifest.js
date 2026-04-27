/** @file src/features/notifications/feature.manifest.js */

import routes from './routes.js'
import { NOTIFICATIONS_PERMISSIONS } from './permissions.js'

export default {
  id: 'notifications',
  type: 'feature',
  name: 'Notifications',
  version: '1.0.0',
  description: 'Firestore inbox plus FCM web push token and delivery management for meaningful declared events.',
  dependencies: {
    features: ['auth'],
    apps: [],
  },
  collections: ['notifications', 'notificationTokens', 'notificationDeliveries', 'notificationPreferences'],
  routes,
  permissions: Object.values(NOTIFICATIONS_PERMISSIONS),
  capabilities: {
    inbox: true,
    fcmPush: true,
    deliveryLogs: true,
    preferences: true,
  },
}
