/** @file src/features/notifications/collections.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Admin-editable templates.
 */
export const notificationTemplatesCollection = defineCollection({
  name: 'notification_templates',
  shard: { type: 'none' },
  schema: {
    key: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    event: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    title: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    body: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    channels: { type: FIELD_TYPES.ARRAY, required: false },
    variables: { type: FIELD_TYPES.ARRAY, required: false },
    active: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true, sortable: true },
    metadata: { type: FIELD_TYPES.OBJECT, required: false },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
  },
});
