/** @file src/features/portal/definitions/portal_accounts.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const portalAccounts = defineCollection({
  name: 'portal_accounts',
  shard: { type: 'none' },
  schema: {
    externalUserId: { type: FIELD_TYPES.STRING, required: true, filterable: true, searchable: true },
    email: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    displayName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    businessProfileKey: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    accountRole: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    avatarUrl: { type: FIELD_TYPES.STRING, required: false },
    preferredLanguage: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    lastSeenAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    suspendedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    suspendedReason: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
})

export default portalAccounts
