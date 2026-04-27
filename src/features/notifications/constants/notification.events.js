/** @file src/features/notifications/constants/notification.events.js */

import { NOTIFICATION_CHANNELS } from './notification.channels.js';
import { NOTIFICATION_PRIORITIES } from './notification.statuses.js';
import { NOTIFICATION_TYPES } from './notification.types.js';

/**
 * Totisoft-oriented event definitions consumed by the orchestrator.
 *
 * Keep legacy aliases where practical so older modules do not break.
 */
export const notificationEventRegistry = Object.freeze({
  'assessment.lead.created': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
    priority: NOTIFICATION_PRIORITIES.HIGH,
    templateKey: 'assessment.lead.created',
  },
  'crm.lead.created': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'crm.lead.created',
  },
  'crm.lead.assigned': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
    priority: NOTIFICATION_PRIORITIES.HIGH,
    templateKey: 'crm.lead.assigned',
  },
  'crm.lead.status_changed': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'crm.lead.status_changed',
  },
  'crm.task.created': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'crm.task.created',
  },
  'crm.engagement.created': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
    priority: NOTIFICATION_PRIORITIES.HIGH,
    templateKey: 'crm.engagement.created',
  },
  'client.record.created': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'client.record.created',
  },
  'finance.transaction.created': {
    type: NOTIFICATION_TYPES.FINANCE,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'finance.transaction.created',
  },
  'finance.transaction.review_requested': {
    type: NOTIFICATION_TYPES.FINANCE,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
    priority: NOTIFICATION_PRIORITIES.HIGH,
    templateKey: 'finance.transaction.review_requested',
  },
  'finance.transaction.posted': {
    type: NOTIFICATION_TYPES.FINANCE,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'finance.transaction.posted',
  },
  'finance.invoice.overdue': {
    type: NOTIFICATION_TYPES.FINANCE,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.WHATSAPP],
    priority: NOTIFICATION_PRIORITIES.CRITICAL,
    templateKey: 'finance.invoice.overdue',
  },
  'document.generated': {
    type: NOTIFICATION_TYPES.DOCUMENTS,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'document.generated',
  },
  'user.role.changed': {
    type: NOTIFICATION_TYPES.AUTH,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
    priority: NOTIFICATION_PRIORITIES.HIGH,
    templateKey: 'user.role.changed',
  },
  'system.alert': {
    type: NOTIFICATION_TYPES.SYSTEM,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.CRITICAL,
    templateKey: 'system.alert',
  },

  // Legacy aliases
  'lead.created': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    templateKey: 'crm.lead.created',
  },
  'lead.assigned': {
    type: NOTIFICATION_TYPES.CRM,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL],
    priority: NOTIFICATION_PRIORITIES.HIGH,
    templateKey: 'crm.lead.assigned',
  },
  'invoice.overdue': {
    type: NOTIFICATION_TYPES.FINANCE,
    channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.WHATSAPP],
    priority: NOTIFICATION_PRIORITIES.CRITICAL,
    templateKey: 'finance.invoice.overdue',
  },
});

export default notificationEventRegistry;
