import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file integrations/collections/integrationWebhooks.definitions.js */
export default defineCollection({
  name: 'integrationWebhooks',
  shard: { type: 'none' },
  schema: {
    integrationId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    url: { type: FIELD_TYPES.STRING, required: true },
    event: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    method: { type: FIELD_TYPES.STRING, required: true, enum: ['POST', 'PUT', 'PATCH'] },
    secretKeyRef: { type: FIELD_TYPES.STRING, required: false },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true },
    lastDeliveredAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
  },
  writableFields: ['integrationId', 'name', 'url', 'event', 'method', 'secretKeyRef', 'isActive', 'lastDeliveredAt'],
  updateableFields: ['name', 'url', 'event', 'method', 'secretKeyRef', 'isActive', 'lastDeliveredAt'],
  indexes: [{ fields: ['integrationId', 'event'] }, { fields: ['event', 'isActive'] }],
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
