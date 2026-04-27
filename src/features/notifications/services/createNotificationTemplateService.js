/** @file src/features/notifications/services/createNotificationTemplateService.js */

import notificationEventRegistry from '../constants/notification.events.js';
import { interpolateTemplate } from '../utils/notification.helpers.js';

const BUILT_IN_TEMPLATES = Object.freeze({
  'assessment.lead.created': {
    key: 'assessment.lead.created',
    title: 'New Totisoft assessment lead',
    body: '{{ leadLabel }} submitted the Totisoft assessment for {{ packageLabel }}.',
  },
  'crm.lead.created': {
    key: 'crm.lead.created',
    title: 'New CRM lead',
    body: '{{ actorName }} created lead {{ entityLabel }}.',
  },
  'crm.lead.assigned': {
    key: 'crm.lead.assigned',
    title: 'Lead assigned to you',
    body: '{{ actorName }} assigned {{ entityLabel }} to you.',
  },
  'crm.lead.status_changed': {
    key: 'crm.lead.status_changed',
    title: 'Lead status changed',
    body: '{{ entityLabel }} moved to {{ statusLabel }}.',
  },
  'crm.task.created': {
    key: 'crm.task.created',
    title: 'New CRM follow-up task',
    body: '{{ entityLabel }} requires follow-up{{ dueAtLabel }}.',
  },
  'crm.engagement.created': {
    key: 'crm.engagement.created',
    title: 'Client engagement created',
    body: '{{ entityLabel }} is now an active Totisoft engagement.',
  },
  'client.record.created': {
    key: 'client.record.created',
    title: 'Client record created',
    body: '{{ entityLabel }} was added to client records.',
  },
  'finance.transaction.created': {
    key: 'finance.transaction.created',
    title: 'Finance draft created',
    body: 'A finance draft was created for {{ entityLabel }}.',
  },
  'finance.transaction.review_requested': {
    key: 'finance.transaction.review_requested',
    title: 'Finance review requested',
    body: '{{ entityLabel }} is waiting for finance review.',
  },
  'finance.transaction.posted': {
    key: 'finance.transaction.posted',
    title: 'Finance entry posted',
    body: '{{ entityLabel }} was posted successfully.',
  },
  'finance.invoice.overdue': {
    key: 'finance.invoice.overdue',
    title: 'Invoice overdue',
    body: '{{ entityLabel }} is overdue. Amount due: {{ amountDue }}.',
  },
  'document.generated': {
    key: 'document.generated',
    title: 'Document generated',
    body: '{{ entityLabel }} was generated successfully.',
  },
  'user.role.changed': {
    key: 'user.role.changed',
    title: 'Role updated',
    body: 'Your role was changed to {{ roleName }}.',
  },
  'system.alert': {
    key: 'system.alert',
    title: 'System alert',
    body: '{{ message }}',
  },
  'lead.created': {
    key: 'lead.created',
    title: 'New CRM lead',
    body: '{{ actorName }} created lead {{ entityLabel }}.',
  },
  'lead.assigned': {
    key: 'lead.assigned',
    title: 'Lead assigned to you',
    body: '{{ actorName }} assigned {{ entityLabel }} to you.',
  },
  'invoice.overdue': {
    key: 'invoice.overdue',
    title: 'Invoice overdue',
    body: '{{ entityLabel }} is overdue. Amount due: {{ amountDue }}.',
  },
});

export function createNotificationTemplateService(options = {}) {
  const templates = options.templates || [];
  const eventRegistry = options.eventRegistry || notificationEventRegistry;

  function getTemplate(event) {
    const custom = templates.find((item) => item.event === event || item.key === event);
    if (custom && custom.active !== false) return custom;

    return BUILT_IN_TEMPLATES[event] || {
      key: event,
      title: eventRegistry[event]?.templateKey || event,
      body: '{{ message }}',
    };
  }

  function renderTemplate(event, variables = {}) {
    const definition = getTemplate(event);
    return {
      title: interpolateTemplate(definition.title || event, variables),
      body: interpolateTemplate(definition.body || '', variables),
      definition,
    };
  }

  return {
    getTemplate,
    renderTemplate,
  };
}

export default createNotificationTemplateService;
