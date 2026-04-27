/** @file src/features/portal/definitions/portal_preferences.definitions.js */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const portalPreferences = defineCollection({
  name: 'portal_preferences',
  shard: { type: 'none' },
  schema: {
    portalAccountId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    externalUserId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    theme: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    locale: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    notificationChannels: { type: FIELD_TYPES.ARRAY, required: false },
    homeSectionKey: { type: FIELD_TYPES.STRING, required: false },
    compactMode: { type: FIELD_TYPES.BOOLEAN, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
  },
})

export default portalPreferences
