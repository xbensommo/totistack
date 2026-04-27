/** @file src/features/notifications/services/createNotificationOrchestrator.js */

import notificationEventRegistry from '../constants/notification.events.js';
import { NOTIFICATION_PRIORITIES } from '../constants/notification.statuses.js';
import { createNotificationId } from '../utils/notification.helpers.js';

function isWithinQuietHours(quietHours = null, now = new Date()) {
  if (!quietHours?.enabled || !quietHours?.start || !quietHours?.end) return false;

  const [startHour, startMinute] = String(quietHours.start).split(':').map(Number);
  const [endHour, endMinute] = String(quietHours.end).split(':').map(Number);
  if (![startHour, startMinute, endHour, endMinute].every(Number.isFinite)) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = (startHour * 60) + startMinute;
  const end = (endHour * 60) + endMinute;

  if (start === end) return false;
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}

export function createNotificationOrchestrator(options) {
  const dispatcher = options.dispatcher;
  const templateService = options.templateService;
  const recipientsService = options.recipientsService;
  const repository = options.repository || {};
  const eventRegistry = options.eventRegistry || notificationEventRegistry;

  function getEventDefinition(event) {
    return eventRegistry[event];
  }

  async function createNotification(payload = {}) {
    if (!payload.event) throw new Error('[notifications] event is required for createNotification().');
    return handleEvent(payload.event, payload);
  }

  async function handleEvent(event, payload = {}) {
    const definition = getEventDefinition(event);
    if (!definition) return [];

    const recipients = await recipientsService.resolveRecipients(event, payload);
    if (!recipients.length) return [];

    const results = [];

    for (const recipient of recipients) {
      const recipientCode = recipient.recipientCode || recipient.userId || recipient.id;
      if (!recipientCode) continue;

      const preferences = typeof repository.getPreferences === 'function'
        ? await repository.getPreferences(recipientCode)
        : null;

      if (preferences?.enabled === false) continue;
      if (preferences?.categorySettings?.[definition.type] === false) continue;

      let permittedChannels = (payload.channels?.length ? payload.channels : definition.channels || []).filter((channel) => {
        if (!preferences?.channels?.length) return true;
        return preferences.channels.includes(channel);
      });

      if (isWithinQuietHours(preferences?.quietHours)) {
        permittedChannels = permittedChannels.filter((channel) => channel === 'in_app');
      }

      if (!permittedChannels.length) continue;

      const variables = {
        ...payload,
        recipientCode,
        recipientName: recipient.recipientName || 'User',
        actorName: payload.actorName || 'System',
        entityLabel: payload.entityLabel || payload.entityName || payload.entityId || 'record',
        leadLabel: payload.leadLabel || payload.entityLabel || payload.businessName || payload.fullName || 'lead',
        packageLabel: payload.packageLabel || payload.recommendationTitle || 'Totisoft service',
        statusLabel: payload.statusLabel || payload.status || 'updated',
        dueAtLabel: payload.dueAt ? ` before ${payload.dueAt}` : '',
        message: payload.message || '',
      };

      const rendered = templateService.renderTemplate(event, variables);
      const deliveries = await dispatcher.dispatch({
        id: createNotificationId(),
        recipientCode,
        recipientName: recipient.recipientName || null,
        recipientEmail: recipient.recipientEmail || null,
        recipientRole: recipient.recipientRole || null,
        recipientType: recipient.recipientType || 'staff',
        userId: recipient.userId || null,
        title: rendered.title,
        message: rendered.body,
        event,
        type: definition.type,
        priority: payload.priority || definition.priority || NOTIFICATION_PRIORITIES.NORMAL,
        actionUrl: payload.actionUrl || null,
        entityType: payload.entityType || null,
        entityId: payload.entityId || null,
        sourceApp: payload.sourceApp || payload.app || null,
        sourceModule: payload.sourceModule || payload.module || null,
        sourceRef: payload.sourceRef || payload.reference || null,
        clientId: payload.clientId || null,
        clientLabel: payload.clientLabel || null,
        crmLeadId: payload.crmLeadId || null,
        engagementId: payload.engagementId || null,
        financeTransactionId: payload.financeTransactionId || null,
        actorCode: payload.actorCode || null,
        actorId: payload.actorId || null,
        actorName: payload.actorName || 'System',
        actorEmail: payload.actorEmail || null,
        channels: permittedChannels,
        meta: payload.meta || null,
        businessContext: payload.businessContext || null,
        createdAt: new Date().toISOString(),
      });

      results.push(...deliveries);
    }

    return results;
  }

  return {
    createNotification,
    notify: createNotification,
    sendNotification: createNotification,
    handleEvent,
    getEventDefinition,
  };
}

export default createNotificationOrchestrator;
