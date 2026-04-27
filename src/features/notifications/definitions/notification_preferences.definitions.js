/** @file src/features/notifications/definitions/notification_preferences.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Totisoft notification preferences.
 */
export const notificationPreferencesCollection = defineCollection({
  name: 'notification_preferences',
  shard: { type: 'none' },
  schema: {
    recipientCode: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    recipientEmail: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    recipientRole: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    userId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    enabled: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true, sortable: true },
    channels: { type: FIELD_TYPES.ARRAY, required: false },
    quietHours: { type: FIELD_TYPES.OBJECT, required: false },
    categorySettings: { type: FIELD_TYPES.OBJECT, required: false },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
  },
});

export default notificationPreferencesCollection;
