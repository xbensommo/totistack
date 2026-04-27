/** @file src/features/notifications/definitions/notification_logs.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Delivery logs and retries.
 */
const notificationLogsCollection = defineCollection({
  name: 'notification_logs',
  shard: { type: 'none', field: 'createdAt' },
  schema: {
    notificationId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    recipientCode: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    recipientEmail: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    recipientRole: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    userId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    channel: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    provider: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    sourceApp: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    sourceModule: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    sourceRef: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    error: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    payload: { type: FIELD_TYPES.OBJECT, required: false },
    response: { type: FIELD_TYPES.OBJECT, required: false },
    sentAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
});

export default notificationLogsCollection;
