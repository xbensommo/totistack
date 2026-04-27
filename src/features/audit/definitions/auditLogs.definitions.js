/**
 * @file src/features/audit/definitions/auditLogs.definitions.js
 * @description Append-only audit evidence for security-sensitive operations.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const auditLogs = defineCollection({
  name: 'auditLogs',
  shard: { type: 'none' },
  schema: {
    actorId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actorEmail: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    actorRoles: { type: FIELD_TYPES.ARRAY, required: false },
    actionId: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    category: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true, sortable: true },
    controlId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true, sortable: true },
    operationId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    correlationId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    requestId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    sessionId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    entityType: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    entityId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    resource: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    source: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    severity: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    policyDecision: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    reason: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    before: { type: MAP, required: false },
    after: { type: MAP, required: false },
    changes: { type: FIELD_TYPES.ARRAY, required: false },
    request: { type: MAP, required: false },
    result: { type: MAP, required: false },
    errorCode: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    errorMessage: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    ipHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    userAgentHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    evidenceHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    retentionClass: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    reviewedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    reviewedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    reviewStatus: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    meta: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'actorId', 'actorEmail', 'actorRoles', 'actionId', 'category', 'controlId', 'operationId', 'correlationId',
    'requestId', 'sessionId', 'entityType', 'entityId', 'resource', 'source', 'status', 'severity', 'policyDecision',
    'reason', 'before', 'after', 'changes', 'request', 'result', 'errorCode', 'errorMessage', 'ipHash', 'userAgentHash',
    'evidenceHash', 'retentionClass', 'reviewedAt', 'reviewedBy', 'reviewStatus', 'meta', 'isDeleted',
  ],
  updateableFields: ['reviewedAt', 'reviewedBy', 'reviewStatus', 'meta'],
  indexes: [
    { fields: ['actionId', 'createdAt'] },
    { fields: ['actorId', 'createdAt'] },
    { fields: ['actorEmail', 'createdAt'] },
    { fields: ['entityType', 'entityId', 'createdAt'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['severity', 'createdAt'] },
    { fields: ['category', 'createdAt'] },
    { fields: ['controlId', 'createdAt'] },
    { fields: ['correlationId', 'createdAt'] },
    { fields: ['reviewStatus', 'createdAt'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  rules: {
    read: 'permission:audit.view',
    create: 'serverOnly',
    update: 'permission:audit.review',
    delete: 'serverOnly',
  },
})
