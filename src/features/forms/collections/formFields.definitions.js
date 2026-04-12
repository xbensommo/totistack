import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/**
 * @file forms/collections/formFields.definitions.js
 * @description Field definitions belonging to a form.
 */
export default defineCollection({
  name: 'formFields',
  shard: { type: 'none' },
  schema: {
    formId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    label: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    key: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    type: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    placeholder: { type: FIELD_TYPES.STRING, required: false },
    helpText: { type: FIELD_TYPES.STRING, required: false },
    isRequired: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    order: { type: FIELD_TYPES.NUMBER, required: true, sortable: true },
    config: { type: FIELD_TYPES.MAP, required: false },
    validation: { type: FIELD_TYPES.MAP, required: false },
    options: { type: FIELD_TYPES.ARRAY, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
  },
  writableFields: ['formId', 'label', 'key', 'type', 'placeholder', 'helpText', 'isRequired', 'order', 'config', 'validation', 'options'],
  updateableFields: ['label', 'key', 'type', 'placeholder', 'helpText', 'isRequired', 'order', 'config', 'validation', 'options'],
  indexes: [{ fields: ['formId', 'order'] }, { fields: ['formId', 'key'] }],
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
