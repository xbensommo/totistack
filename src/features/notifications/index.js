/** @file src/features/notifications/index.js */

export { default as notificationsFeatureManifest } from './feature.manifest.js'
export * from './feature.manifest.js'
export { default as notificationsRoutes } from './routes.js'
export * from './routes.js'
export * from './permissions.js'

export * from './definitions/notifications.definitions.js'
export * from './definitions/notificationPreferences.definitions.js'
export * from './definitions/notificationTokens.definitions.js'
export * from './definitions/notificationDeliveries.definitions.js'
export * from './definitions/notification_logs.definitions.js'
export * from './definitions/notification_templates.definitions.js'
export * from './definitions/notification_preferences.definitions.js'

export * from './constants/notification.channels.js'
export * from './constants/notification.events.js'
export * from './constants/notification.statuses.js'
export * from './constants/notification.types.js'

export * from './utils/notification.filters.js'
export * from './utils/notification.helpers.js'

export * from './services/fcmClient.service.js'
export * from './services/notificationClient.service.js'
export * from './services/createNotificationDispatcher.js'
export * from './services/createNotificationOrchestrator.js'
export * from './services/createNotificationRecipientsService.js'
export * from './services/createNotificationRepository.js'
export * from './services/createNotificationTemplateService.js'

export * from './runtime/createDomainEventBus.js'
export * from './runtime/notification-hooks.js'
export * from './runtime/register-notifications.js'

export * from './stores/useNotificationsStore.js'
export * from './composables/useNotifications.js'
export * from './composables/useUnreadCount.js'

export { default as NotificationBell } from './components/NotificationBell.vue'
export { default as NotificationDrawer } from './components/NotificationDrawer.vue'
export { default as NotificationList } from './components/NotificationList.vue'
export { default as NotificationFilters } from './components/NotificationFilters.vue'
export { default as NotificationPreferencesForm } from './components/NotificationPreferencesForm.vue'

export { default as NotificationCenterPage } from './pages/NotificationCenterPage.vue'
export { default as NotificationPreferencesPage } from './pages/NotificationPreferencesPage.vue'
export { default as NotificationTemplatesPage } from './pages/NotificationTemplatesPage.vue'
export { default as NotificationDeliveryLogsPage } from './pages/NotificationDeliveryLogsPage.vue'
export { default as NotificationDeliveriesPage } from './pages/NotificationDeliveriesPage.vue'
