/** @file src/features/portal/definitions/portal_tickets.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const portalTickets = defineCollection({
  name: 'portal_tickets',
  shard: { type: 'none' },
  schema: {
    portalAccountId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    externalUserId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    membershipId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    subject: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    message: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    category: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    priority: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    linkedEntityType: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    linkedEntityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    assignedTo: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    businessProfileKey: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
})

export default portalTickets
