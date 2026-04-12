import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/**
 * @file forms/collections/formWebhooks.definitions.js
 * @description Webhook endpoints triggered by form events.
 */
export default defineCollection({
  name: 'formWebhooks',
  shard: { type: 'none' },
  schema: {
    formId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    url: { type: FIELD_TYPES.STRING, required: true },
    method: { type: FIELD_TYPES.STRING, required: true, enum: ['POST', 'PUT', 'PATCH'] },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true },
    headers: { type: FIELD_TYPES.MAP, required: false },
    triggerOn: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    lastTriggeredAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
  },
  writableFields: ['formId', 'name', 'url', 'method', 'isActive', 'headers', 'triggerOn', 'lastTriggeredAt'],
  updateableFields: ['name', 'url', 'method', 'isActive', 'headers', 'triggerOn', 'lastTriggeredAt'],
  indexes: [{ fields: ['formId', 'isActive'] }, { fields: ['triggerOn', 'isActive'] }],
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
