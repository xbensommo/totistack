/** @file src/features/notifications/index.js */

export { default as notificationsFeatureManifest } from './feature.manifest.js'
export { default as notificationsRoutes } from './routes.js'
export * from './permissions.js'
export * from './definitions/notifications.definitions.js'
export * from './definitions/notificationsPreferences.definitions.js'
export * from './definitions/notificationsTokens.definitions.js'
export * from './definitions/notificationsDelivieries.definitions.js'

export * from './services/notificationClient.service.js'
export * from './services/fcmClient.service.js'
