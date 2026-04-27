/** @file src/features/notifications/services/createNotificationRepository.js */

import { createShardedActions } from '@xbensommo/shard-provider';

function firstDefined(...values) {
  return values.find((value) => value != null && value !== '');
}

export function createNotificationRepository(options = {}) {
  const provider = options.provider;
  const createActions = options.createActions || createShardedActions;
  const states = options.states || {
    notifications: { items: [], loading: false, error: null },
    notification_preferences: { items: [], loading: false, error: null },
    notification_templates: { items: [], loading: false, error: null },
    notification_logs: { items: [], loading: false, error: null },
  };

  const actions = {
    notifications:
      options.actions?.notifications || createActions('notifications', states.notifications, provider),
    notification_preferences:
      options.actions?.notification_preferences || createActions('notification_preferences', states.notification_preferences, provider),
    notification_templates:
      options.actions?.notification_templates || createActions('notification_templates', states.notification_templates, provider),
    notification_logs:
      options.actions?.notification_logs || createActions('notification_logs', states.notification_logs, provider),
  };

  async function listNotifications(params = {}) {
    const { recipientCode, userId, filters = [], limit = 50 } = params;
    const mergedFilters = [...filters];
    const resolvedRecipientCode = firstDefined(recipientCode, userId);

    if (resolvedRecipientCode) {
      mergedFilters.push({ field: recipientCode ? 'recipientCode' : 'userId', op: '==', value: resolvedRecipientCode });
    }

    await actions.notifications.fetchInitialPage({
      filters: mergedFilters,
      limit,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
    });

    return states.notifications.items || [];
  }

  async function listTemplates() {
    await actions.notification_templates.fetchInitialPage({
      limit: 100,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
    });

    return states.notification_templates.items || [];
  }

  async function listLogs(params = {}) {
    const { notificationId, recipientCode, limit = 100 } = params;
    const filters = [];

    if (notificationId) filters.push({ field: 'notificationId', op: '==', value: notificationId });
    if (recipientCode) filters.push({ field: 'recipientCode', op: '==', value: recipientCode });

    await actions.notification_logs.fetchInitialPage({
      filters,
      limit,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
    });

    return states.notification_logs.items || [];
  }

  async function getPreferences(recipientCodeOrUserId) {
    if (!recipientCodeOrUserId) return null;

    await actions.notification_preferences.fetchInitialPage({
      filters: [{ field: 'recipientCode', op: '==', value: recipientCodeOrUserId }],
      limit: 1,
      orderBy: [{ field: 'updatedAt', direction: 'desc' }],
    });

    let current = states.notification_preferences.items?.[0] || null;
    if (current) return current;

    await actions.notification_preferences.fetchInitialPage({
      filters: [{ field: 'userId', op: '==', value: recipientCodeOrUserId }],
      limit: 1,
      orderBy: [{ field: 'updatedAt', direction: 'desc' }],
    });

    return states.notification_preferences.items?.[0] || null;
  }

  async function saveNotification(payload) {
    return actions.notifications.add(payload);
  }

  async function updateNotification(notificationId, payload) {
    return actions.notifications.update(notificationId, payload);
  }

  async function saveLog(payload) {
    return actions.notification_logs.add(payload);
  }

  async function upsertPreferences(recipientCode, payload = {}) {
    const lookupKey = firstDefined(recipientCode, payload.recipientCode, payload.userId);
    const current = await getPreferences(lookupKey);
    const now = new Date().toISOString();

    if (current?.id) {
      await actions.notification_preferences.update(current.id, {
        ...payload,
        updatedAt: now,
      });
      return { ...current, ...payload, updatedAt: now };
    }

    return actions.notification_preferences.add({
      recipientCode: firstDefined(recipientCode, payload.recipientCode, payload.userId),
      recipientEmail: payload.recipientEmail || null,
      recipientRole: payload.recipientRole || null,
      userId: payload.userId || null,
      enabled: payload.enabled ?? true,
      channels: payload.channels || ['in_app'],
      quietHours: payload.quietHours || { enabled: false, start: '22:00', end: '06:00' },
      categorySettings: payload.categorySettings || {},
      createdAt: payload.createdAt || now,
      updatedAt: now,
    });
  }

  async function markRead(notificationId, payload = {}) {
    return actions.notifications.update(notificationId, {
      readAt: payload.readAt || new Date().toISOString(),
      status: payload.status || 'read',
      updatedAt: new Date().toISOString(),
    });
  }

  async function markAllRead(recipientCode, ids = []) {
    const targetIds = ids.length ? ids : (await listNotifications({ recipientCode, limit: 200 }))
      .filter((item) => !item.readAt)
      .map((item) => item.id);

    return Promise.all(targetIds.map((id) => markRead(id)));
  }

  async function archiveNotification(notificationId) {
    return actions.notifications.update(notificationId, {
      archivedAt: new Date().toISOString(),
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    listNotifications,
    listTemplates,
    listLogs,
    getPreferences,
    saveNotification,
    updateNotification,
    saveLog,
    upsertPreferences,
    markRead,
    markAllRead,
    archiveNotification,
    actions,
    states,
  };
}

export default createNotificationRepository;
