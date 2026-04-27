/** @file src/features/portal/definitions/portal_memberships.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const portalMemberships = defineCollection({
  name: 'portal_memberships',
  shard: { type: 'none' },
  schema: {
    portalAccountId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    externalUserId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    membershipRole: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    businessProfileKey: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    linkedRecordType: { type: FIELD_TYPES.STRING, required: false, filterable: true, searchable: true },
    linkedRecordId: { type: FIELD_TYPES.STRING, required: false, filterable: true, searchable: true },
    linkedAccountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    linkedClientId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    linkedStudentId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    linkedOrderId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    visibilityScope: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
})

export default portalMemberships
