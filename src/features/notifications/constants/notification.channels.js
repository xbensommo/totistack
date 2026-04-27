/** @file src/features/notifications/constants/notification.channels.js */

/**
 * Supported delivery channels.
 */
export const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: 'in_app',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  PUSH: 'push',
});

export const DEFAULT_NOTIFICATION_CHANNELS = Object.freeze([
  NOTIFICATION_CHANNELS.IN_APP,
]);

export default NOTIFICATION_CHANNELS;
