/** @file src/features/portal/definitions/portal_invites.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const portalInvites = defineCollection({
  name: 'portal_invites',
  shard: { type: 'none' },
  schema: {
    email: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    businessProfileKey: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    invitedRole: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    inviteToken: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    acceptedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    invitedBy: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    note: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    linkedRecordType: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    linkedRecordId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
})

export default portalInvites
