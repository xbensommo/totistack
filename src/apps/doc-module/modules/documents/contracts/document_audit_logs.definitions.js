/** @file src/modules/documents/contracts/collections.js */
import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';


/**
 * Workflow audit log for compliance, approvals, and export history.
 */
export const documentAuditLogsCollection = defineCollection({
  name: 'document_audit_logs',
  shard: { type: 'none' },
  timestamps: true,
  schema: {
    documentId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    event: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    actorId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actorName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    before: { type: FIELD_TYPES.OBJECT, required: false },
    after: { type: FIELD_TYPES.OBJECT, required: false },
    meta: { type: FIELD_TYPES.OBJECT, required: false },
  },
});
