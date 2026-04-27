/**
 * @file booking/services/bookingService.js
 * @description Booking service adapter built for the latest Totistack root-store flow.
 */

import { useAppStore } from '@app/stores/appStore'

export class BookingError extends Error {
  constructor(message, code = 'BOOKING_ERROR', cause = null) {
    super(message)
    this.name = 'BookingError'
    this.code = code
    this.cause = cause
  }
}

function resolveBookingActions(store) {
  const actions = store?.bookingsActions || null

  if (!actions || typeof actions !== 'object') {
    throw new BookingError(
      'Missing root-store shard actions: store.bookingsActions',
      'BOOKING_ACTIONS_UNAVAILABLE'
    )
  }

  return actions
}

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new BookingError('Invalid booking date supplied.', 'INVALID_DATE')
  }
  return date
}

function toTimestampValue(value) {
  return value
}

function createBookingNumber() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BKG-${yyyy}${mm}${dd}-${random}`
}

function createAccessCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function normalizeReminderChannels(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(Boolean).map((item) => String(item).trim().toLowerCase()))]
  }

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([channel]) => channel.toLowerCase())
  }

  return []
}

function buildReminders(startTime, channels = ['email']) {
  const reminders = []
  const now = new Date()

  const offsets = [
    { key: 'day_before', hours: 24 },
    { key: 'hour_before', hours: 1 },
  ]

  for (const channel of channels) {
    for (const offset of offsets) {
      const when = new Date(startTime)
      when.setHours(when.getHours() - offset.hours)

      if (when > now) {
        reminders.push({
          channel,
          type: offset.key,
          time: when,
          sent: false,
          status: 'scheduled',
        })
      }
    }
  }

  return reminders
}

function buildReminderSummary(channels, reminders) {
  if (!channels.length || !reminders.length) {
    return 'No reminders scheduled.'
  }

  const channelLabel = channels.join(', ')
  const count = reminders.length
  return `${count} reminder${count === 1 ? '' : 's'} scheduled via ${channelLabel}.`
}

function validateSchedule(startTime, endTime) {
  if (endTime <= startTime) {
    throw new BookingError('End time must be after start time.', 'INVALID_TIME_RANGE')
  }

  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
  if (durationMinutes < 15) {
    throw new BookingError('Booking duration must be at least 15 minutes.', 'BOOKING_TOO_SHORT')
  }

  if (durationMinutes > 8 * 60) {
    throw new BookingError('Booking duration cannot exceed 8 hours.', 'BOOKING_TOO_LONG')
  }
}

function normalizeBooking(booking) {
  if (!booking) return null

  return {
    ...booking,
    id: booking.id || booking.bookingId || null,
  }
}

function normalizeCollectionItems(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.value?.items)) return value.value.items
  if (Array.isArray(value?.value)) return value.value
  return []
}

function normalizeFilters(filters = []) {
  if (Array.isArray(filters)) return filters
  return Object.entries(filters || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([field, value]) => ({ field, op: '==', value }))
}

function normalizeFetchParams(params = {}) {
  const normalized = { ...params, filters: normalizeFilters(params.filters) }
  if (typeof normalized.orderBy === 'string') {
    normalized.orderBy = [{ field: normalized.orderBy, direction: params.orderDirection || 'desc' }]
  }
  delete normalized.orderDirection
  return normalized
}

export function createBookingServices({ store = useAppStore() } = {}) {
  const actions = resolveBookingActions(store)

  function getCurrentUser() {
    return store.currentUser?.value || store.currentUser || null
  }

  function getCurrentUserId() {
    return getCurrentUser()?.uid || ''
  }

  function getCurrentUserEmail() {
    return getCurrentUser()?.email || ''
  }

  async function list(params = {}) {
    if (typeof actions.fetchInitialPage !== 'function') {
      throw new BookingError(
        'Missing shard action method: bookingsActions.fetchInitialPage',
        'LIST_NOT_SUPPORTED'
      )
    }

    return actions.fetchInitialPage(normalizeFetchParams(params))
  }

  async function getById(bookingId) {
    if (!bookingId) {
      throw new BookingError('Booking id is required.', 'BOOKING_ID_REQUIRED')
    }

    if (typeof actions.getById !== 'function') {
      throw new BookingError(
        'Booking retrieval is not supported by the current action adapter.',
        'GET_BY_ID_NOT_SUPPORTED'
      )
    }

    return normalizeBooking(await actions.getById(bookingId))
  }

  async function getByReference(reference, contact) {
    const normalizedReference = String(reference || '').trim().toLowerCase()
    const normalizedContact = String(contact || '').trim().toLowerCase()

    if (!normalizedReference || !normalizedContact) {
      throw new BookingError(
        'Booking reference and customer contact are required.',
        'PUBLIC_LOOKUP_INVALID'
      )
    }

    if (typeof actions.search === 'function') {
      const result = await actions.search({
        search: normalizedReference,
        limit: 25,
      })

      const items = normalizeCollectionItems(result)
      const match = items.find((item) => {
        const referenceMatch = [item.bookingNumber, item.accessCode]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase())
          .includes(normalizedReference)

        const contactMatch = [item.customerEmail, item.customerPhone]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase())
          .includes(normalizedContact)

        return referenceMatch && contactMatch
      })

      return normalizeBooking(match || null)
    }

    await list({ orderBy: [{ field: 'createdAt', direction: 'desc' }], limit: 100 })
    const items = normalizeCollectionItems(store.bookings)
    const match = items.find((item) => {
      const referenceMatch = [item.bookingNumber, item.accessCode]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .includes(normalizedReference)

      const contactMatch = [item.customerEmail, item.customerPhone]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .includes(normalizedContact)

      return referenceMatch && contactMatch
    })

    return normalizeBooking(match || null)
  }

  async function create(payload) {
    const userId = getCurrentUserId()
    const userEmail = getCurrentUserEmail()
    const isAuthenticated = Boolean(userId)
    const startTime = toDate(payload.startTime)
    const endTime = toDate(payload.endTime)

    validateSchedule(startTime, endTime)

    if (!payload.customerName) {
      throw new BookingError('Customer name is required.', 'CUSTOMER_NAME_REQUIRED')
    }

    if (!isAuthenticated && !payload.customerEmail && !payload.customerPhone) {
      throw new BookingError(
        'Guest bookings require at least an email or phone number.',
        'GUEST_CONTACT_REQUIRED'
      )
    }

    const reminderChannels = normalizeReminderChannels(payload.reminderChannels || ['email'])
    const reminders = buildReminders(startTime, reminderChannels)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    const accessCode = payload.accessCode || createAccessCode()

    const attendees = Array.isArray(payload.attendees)
      ? payload.attendees
      : payload.attendeeCount > 1
        ? Array.from({ length: Number(payload.attendeeCount || 1) }, (_, index) => ({
            label: `Guest ${index + 1}`,
          }))
        : []

    const record = {
      bookingNumber: payload.bookingNumber || createBookingNumber(),
      clientId: payload.clientId || userId || 'guest',
      customerType: isAuthenticated ? 'authenticated' : 'guest',
      ownerUserId: payload.ownerUserId || userId || '',
      ownerEmail: payload.ownerEmail || userEmail || payload.customerEmail || '',
      accessCode,
      bookingChannel: payload.bookingChannel || (isAuthenticated ? 'authenticated' : 'public'),
      bookingSource: payload.bookingSource || 'booking_form',
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || userEmail || '',
      customerPhone: payload.customerPhone || '',
      serviceId: payload.serviceId || '',
      serviceName: payload.serviceName || payload.title || '',
      locationId: payload.locationId || '',
      locationName: payload.locationName || '',
      resourceId: payload.resourceId || '',
      resourceType: payload.resourceType || '',
      assignedTo: payload.assignedTo || '',
      assignedToName: payload.assignedToName || '',
      title: payload.title || payload.serviceName || 'New Booking',
      description: payload.description || '',
      notes: payload.notes || '',
      specialRequests: payload.specialRequests || '',
      timezone:
        payload.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'UTC',
      startTime: toTimestampValue(startTime),
      endTime: toTimestampValue(endTime),
      durationMinutes,
      attendeeCount: Number(payload.attendeeCount || attendees.length || 1),
      status: payload.status || 'pending',
      amount: Number(payload.amount || 0),
      currency: payload.currency || 'USD',
      paymentStatus: payload.paymentStatus || 'pending',
      attendees,
      reminderChannels,
      reminders,
      reminderStatus: reminders.length ? 'scheduled' : 'disabled',
      reminderSummary: buildReminderSummary(reminderChannels, reminders),
      reminderLastScheduledAt: reminders.length ? new Date() : null,
      reminderLastSentAt: null,
      createdBy: userId || 'public',
    }

    if (typeof actions.create === 'function') {
      return normalizeBooking(await actions.create(record))
    }

    if (typeof actions.add === 'function') {
      return normalizeBooking(await actions.add(record))
    }

    if (typeof actions.setById === 'function') {
      const id = payload.id || `booking_${Date.now()}`
      await actions.setById(id, record)
      return getById(id)
    }

    throw new BookingError(
      'Booking creation is not supported by the current action adapter.',
      'CREATE_NOT_SUPPORTED'
    )
  }

  async function update(bookingId, updates) {
    if (!bookingId) {
      throw new BookingError('Booking id is required.', 'BOOKING_ID_REQUIRED')
    }

    if (updates.startTime || updates.endTime) {
      const current = await getById(bookingId)
      const startTime = toDate(updates.startTime || current?.startTime)
      const endTime = toDate(updates.endTime || current?.endTime)
      validateSchedule(startTime, endTime)
      updates.durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    }

    if (typeof actions.update === 'function') {
      await actions.update(bookingId, updates)
      return getById(bookingId)
    }

    throw new BookingError(
      'Booking updates are not supported by the current action adapter.',
      'UPDATE_NOT_SUPPORTED'
    )
  }

  async function reschedule(bookingId, payload) {
    const startTime = toDate(payload.startTime)
    const endTime = toDate(payload.endTime)
    validateSchedule(startTime, endTime)

    const reminderChannels = normalizeReminderChannels(payload.reminderChannels || ['email'])
    const reminders = buildReminders(startTime, reminderChannels)

    return update(bookingId, {
      startTime,
      endTime,
      status: 'rescheduled',
      reminderChannels,
      reminders,
      reminderStatus: reminders.length ? 'scheduled' : 'disabled',
      reminderSummary: buildReminderSummary(reminderChannels, reminders),
      reminderLastScheduledAt: reminders.length ? new Date() : null,
    })
  }

  async function updateReminderPreferences(bookingId, channels) {
    const booking = await getById(bookingId)
    const reminderChannels = normalizeReminderChannels(channels)
    const reminders = buildReminders(toDate(booking.startTime), reminderChannels)

    return update(bookingId, {
      reminderChannels,
      reminders,
      reminderStatus: reminders.length ? 'scheduled' : 'disabled',
      reminderSummary: buildReminderSummary(reminderChannels, reminders),
      reminderLastScheduledAt: reminders.length ? new Date() : null,
    })
  }

  async function queueReminder(bookingId, channel = 'email') {
    const booking = await getById(bookingId)
    const reminders = Array.isArray(booking?.reminders) ? [...booking.reminders] : []

    reminders.push({
      channel,
      type: 'manual',
      time: new Date(),
      sent: false,
      status: 'queued',
    })

    return update(bookingId, {
      reminders,
      reminderStatus: 'queued',
      reminderSummary: buildReminderSummary(
        normalizeReminderChannels(booking.reminderChannels || [channel]),
        reminders
      ),
      reminderLastScheduledAt: new Date(),
    })
  }

  async function cancel(bookingId, reason = '') {
    const userId = getCurrentUserId()

    return update(bookingId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: userId || 'public',
      cancellationReason: reason,
    })
  }

  async function confirm(bookingId) {
    const userId = getCurrentUserId()

    return update(bookingId, {
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: userId || 'system',
    })
  }

  async function checkIn(bookingId) {
    return update(bookingId, {
      status: 'checked_in',
      checkedInAt: new Date(),
    })
  }

  async function complete(bookingId, payload = {}) {
    return update(bookingId, {
      status: 'completed',
      checkedOutAt: new Date(),
      rating: payload.rating,
      feedback: payload.feedback,
      reminderStatus: 'completed',
    })
  }

  return {
    list,
    getById,
    getByReference,
    create,
    update,
    reschedule,
    updateReminderPreferences,
    queueReminder,
    cancel,
    confirm,
    checkIn,
    complete,
  }
}

export default createBookingServices
