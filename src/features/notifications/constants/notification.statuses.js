/** @file src/features/notifications/constants/notification.statuses.js */

/**
 * Notification lifecycle statuses.
 */
export const NOTIFICATION_STATUSES = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  READ: 'read',
  ARCHIVED: 'archived',
});

export const NOTIFICATION_PRIORITIES = Object.freeze({
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
});

export default NOTIFICATION_STATUSES;
