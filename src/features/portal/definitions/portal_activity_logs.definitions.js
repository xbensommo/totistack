/** @file src/features/portal/definitions/portal_activity_logs.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const portalActivityLogs = defineCollection({
  name: 'portal_activity_logs',
  shard: { type: 'none' },
  schema: {
    portalAccountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    externalUserId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    membershipId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actionKey: { type: FIELD_TYPES.STRING, required: true, filterable: true, searchable: true },
    title: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    entityType: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    entityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actorType: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actorId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    meta: { type: FIELD_TYPES.OBJECT, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
})

export default portalActivityLogs
