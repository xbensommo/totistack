/**
 * @file auth/collections/access_reviews.definitions.js
 * @description Access review evidence for SOC 2 CC6-style logical access controls.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export default defineCollection({
  name: 'access_reviews',
  shard: { type: 'none' },
  schema: {
    periodKey: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    scope: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    ownerUid: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    reviewerUid: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    reviewerName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    reviewedUserIds: { type: FIELD_TYPES.ARRAY, required: false },
    exceptions: { type: FIELD_TYPES.ARRAY, required: false },
    findings: { type: FIELD_TYPES.ARRAY, required: false },
    remediationDueAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    completedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    evidenceHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    evidenceLocation: { type: FIELD_TYPES.STRING, required: false },
    policySnapshot: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'periodKey', 'scope', 'ownerUid', 'reviewerUid', 'reviewerName', 'status', 'reviewedUserIds', 'exceptions',
    'findings', 'remediationDueAt', 'completedAt', 'evidenceHash', 'evidenceLocation', 'policySnapshot', 'isDeleted',
  ],
  updateableFields: [
    'reviewerUid', 'reviewerName', 'status', 'reviewedUserIds', 'exceptions', 'findings', 'remediationDueAt',
    'completedAt', 'evidenceHash', 'evidenceLocation', 'policySnapshot', 'isDeleted',
  ],
  indexes: [
    { fields: ['periodKey', 'scope'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['ownerUid', 'status'] },
    { fields: ['reviewerUid', 'status'] },
    { fields: ['completedAt', 'status'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  rules: {
    read: 'permission:auth.accessReviews.view',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})
