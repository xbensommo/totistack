/** @file src/modules/documents/contracts/collections.js */
import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Primary business documents collection.
 * Monthly sharding keeps invoice/quote/contract growth predictable.
 */
export const documentsCollection = defineCollection({
  name: 'documents',
  shard: { type: 'none' },
  timestamps: true,
  softDelete: true,
  schema: {
    number: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true, sortable: true },
    type: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    clientId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    clientSnapshot: { type: FIELD_TYPES.OBJECT, required: false },
    issuerSnapshot: { type: FIELD_TYPES.OBJECT, required: false },
    brandingId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    templateId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    currency: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    vatRate: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    lineItems: { type: FIELD_TYPES.ARRAY, required: false },
    subtotal: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    vatAmount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    total: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    notes: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    terms: { type: FIELD_TYPES.ARRAY, required: false },
    signatureMode: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    signature: { type: FIELD_TYPES.OBJECT, required: false },
    stamp: { type: FIELD_TYPES.OBJECT, required: false },
    pdf: { type: FIELD_TYPES.OBJECT, required: false },
    dates: { type: FIELD_TYPES.OBJECT, required: false },
    metadata: { type: FIELD_TYPES.OBJECT, required: false },
  },
});
