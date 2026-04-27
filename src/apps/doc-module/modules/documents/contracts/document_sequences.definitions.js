/** @file src/modules/documents/contracts/collections.js */
import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Sequence tracker for deterministic document numbering per year and type.
 */
export const documentSequencesCollection = defineCollection({
  name: 'document_sequences',
  shard: { type: 'none' },
  timestamps: true,
  schema: {
    year: { type: FIELD_TYPES.NUMBER, required: true, filterable: true, sortable: true },
    type: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    lastNumber: { type: FIELD_TYPES.NUMBER, required: true, sortable: true },
    prefix: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
  },
});
