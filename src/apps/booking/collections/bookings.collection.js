/**
 * @file booking/collections/bookings.collection.js
 * @description Booking collection definition aligned with @xbensommo/shard-provider.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/**
 * Booking records.
 *
 * Notes:
 * - The root application provides the single shard provider instance.
 * - This file declares the collection only; it does not create actions.
 */
export default defineCollection({
  name: 'bookings',
  shard: { type: 'monthly' },
  schema: {
    bookingNumber: {
      type: FIELD_TYPES.STRING,
      required: true,
      sortable: true,
      filterable: true,
      searchable: true,
    },
    clientId: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
    },
    customerName: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
      sortable: true,
    },
    customerEmail: {
      type: FIELD_TYPES.STRING,
      required: false,
      searchable: true,
    },
    customerPhone: {
      type: FIELD_TYPES.STRING,
      required: false,
      searchable: true,
    },
    resourceId: {
      type: FIELD_TYPES.STRING,
      required: false,
      filterable: true,
    },
    resourceType: {
      type: FIELD_TYPES.STRING,
      required: false,
      filterable: true,
      sortable: true,
    },
    title: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
      sortable: true,
    },
    description: {
      type: FIELD_TYPES.STRING,
      required: false,
      searchable: true,
    },
    notes: {
      type: FIELD_TYPES.STRING,
      required: false,
    },
    specialRequests: {
      type: FIELD_TYPES.STRING,
      required: false,
    },
    timezone: {
      type: FIELD_TYPES.STRING,
      required: false,
      filterable: true,
    },
    startTime: {
      type: FIELD_TYPES.TIMESTAMP,
      required: true,
      sortable: true,
      filterable: true,
    },
    endTime: {
      type: FIELD_TYPES.TIMESTAMP,
      required: true,
      sortable: true,
      filterable: true,
    },
    durationMinutes: {
      type: FIELD_TYPES.NUMBER,
      required: true,
      sortable: true,
      filterable: true,
    },
    status: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'],
      filterable: true,
      sortable: true,
    },
    amount: {
      type: FIELD_TYPES.NUMBER,
      required: false,
      filterable: true,
      sortable: true,
    },
    currency: {
      type: FIELD_TYPES.STRING,
      required: false,
      filterable: true,
    },
    paymentStatus: {
      type: FIELD_TYPES.STRING,
      required: false,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      filterable: true,
    },
    attendees: {
      type: FIELD_TYPES.ARRAY,
      required: false,
    },
    reminders: {
      type: FIELD_TYPES.ARRAY,
      required: false,
    },
    confirmedAt: {
      type: FIELD_TYPES.TIMESTAMP,
      required: false,
      filterable: true,
    },
    confirmedBy: {
      type: FIELD_TYPES.STRING,
      required: false,
      filterable: true,
    },
    cancelledAt: {
      type: FIELD_TYPES.TIMESTAMP,
      required: false,
      filterable: true,
    },
    cancelledBy: {
      type: FIELD_TYPES.STRING,
      required: false,
      filterable: true,
    },
    cancellationReason: {
      type: FIELD_TYPES.STRING,
      required: false,
    },
    checkedInAt: {
      type: FIELD_TYPES.TIMESTAMP,
      required: false,
      filterable: true,
    },
    checkedOutAt: {
      type: FIELD_TYPES.TIMESTAMP,
      required: false,
      filterable: true,
    },
    rating: {
      type: FIELD_TYPES.NUMBER,
      required: false,
      filterable: true,
      sortable: true,
    },
    feedback: {
      type: FIELD_TYPES.STRING,
      required: false,
    },
    createdAt: {
      type: FIELD_TYPES.TIMESTAMP,
      readonly: true,
      system: true,
      sortable: true,
      filterable: true,
    },
    updatedAt: {
      type: FIELD_TYPES.TIMESTAMP,
      readonly: true,
      system: true,
      sortable: true,
      filterable: true,
    },
    createdBy: {
      type: FIELD_TYPES.STRING,
      readonly: true,
      system: true,
      filterable: true,
    },
  },
  writableFields: [
    'bookingNumber',
    'clientId',
    'customerName',
    'customerEmail',
    'customerPhone',
    'resourceId',
    'resourceType',
    'title',
    'description',
    'notes',
    'specialRequests',
    'timezone',
    'startTime',
    'endTime',
    'durationMinutes',
    'status',
    'amount',
    'currency',
    'paymentStatus',
    'attendees',
    'reminders',
    'confirmedAt',
    'confirmedBy',
    'cancelledAt',
    'cancelledBy',
    'cancellationReason',
    'checkedInAt',
    'checkedOutAt',
    'rating',
    'feedback',
  ],
  updateableFields: [
    'clientId',
    'customerName',
    'customerEmail',
    'customerPhone',
    'resourceId',
    'resourceType',
    'title',
    'description',
    'notes',
    'specialRequests',
    'timezone',
    'startTime',
    'endTime',
    'durationMinutes',
    'status',
    'amount',
    'currency',
    'paymentStatus',
    'attendees',
    'reminders',
    'confirmedAt',
    'confirmedBy',
    'cancelledAt',
    'cancelledBy',
    'cancellationReason',
    'checkedInAt',
    'checkedOutAt',
    'rating',
    'feedback',
  ],
  indexes: [
    { fields: ['clientId', 'startTime'] },
    { fields: ['status', 'startTime'] },
    { fields: ['resourceId', 'startTime'] },
    { fields: ['createdBy', 'createdAt'] },
    { fields: ['paymentStatus', 'startTime'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['bookingNumber', 'customerName', 'customerEmail', 'title', 'description'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'ownerOrAdmin',
    delete: 'ownerOrAdmin',
  },
})
