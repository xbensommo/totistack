/** @file src/modules/documents/contracts/collections.js */
import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';


/**
 * Shared reusable templates for invoices, quotations, agreements, and custom layouts.
 */
export const documentTemplatesCollection = defineCollection({
  name: 'document_templates',
  shard: { type: 'none' },
  timestamps: true,
  softDelete: true,
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    type: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    active: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true, sortable: true },
    page: { type: FIELD_TYPES.OBJECT, required: false },
    branding: { type: FIELD_TYPES.OBJECT, required: false },
    header: { type: FIELD_TYPES.OBJECT, required: false },
    footer: { type: FIELD_TYPES.OBJECT, required: false },
    sections: { type: FIELD_TYPES.ARRAY, required: false },
    typography: { type: FIELD_TYPES.OBJECT, required: false },
    table: { type: FIELD_TYPES.OBJECT, required: false },
    signatureBlock: { type: FIELD_TYPES.OBJECT, required: false },
    stamp: { type: FIELD_TYPES.OBJECT, required: false },
    legal: { type: FIELD_TYPES.OBJECT, required: false },
  },
});
