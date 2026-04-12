/**
 * @file booking/services/bookingService.js
 * @description Booking service adapter built for the latest Totistack root-store flow.
 *
 * This service does not talk to Firestore directly.
 * It expects booking collection actions to come from the root store, which itself
 * is assembled from src/generated/* and the single root shard-provider instance.
 */

import { useAppStore } from '@app/stores/appStore'

/**
 * Friendly application error for booking workflows.
 */
export class BookingError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   * @param {unknown} [cause]
   */
  constructor(message, code = 'BOOKING_ERROR', cause = null) {
    super(message)
    this.name = 'BookingError'
    this.code = code
    this.cause = cause
  }
}

/**
 * Resolve booking collection actions from the root app store.
 *
 * Supports a few shapes so the app remains easier to integrate while Totistack
 * settles on the final generated registry conventions.
 *
 * @param {Record<string, any>} store
 * @returns {Record<string, Function>}
 */
function resolveBookingActions(store) {
  const actions =
    store?.bookingsActions ||
    store?.bookingActions ||
    store?.collectionsActions?.bookings ||
    null

  if (!actions || typeof actions !== 'object') {
    throw new BookingError(
      'Booking actions are not available on the root store.',
      'BOOKING_ACTIONS_UNAVAILABLE'
    )
  }

  return actions
}

/**
 * Normalize a date-like value.
 *
 * @param {string|number|Date} value
 * @returns {Date}
 */
function toDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new BookingError('Invalid booking date supplied.', 'INVALID_DATE')
  }
  return date
}

/**
 * Convert a JS Date to a store/provider friendly timestamp payload.
 * The root provider may normalize this further if needed.
 *
 * @param {Date} value
 * @returns {Date}
 */
function toTimestampValue(value) {
  return value
}

/**
 * Create a booking number that is predictable and readable.
 *
 * @returns {string}
 */
function createBookingNumber() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BKG-${yyyy}${mm}${dd}-${random}`
}

/**
 * Build reminder payloads from a start date.
 *
 * @param {Date} startTime
 * @returns {Array<object>}
 */
function buildReminders(startTime) {
  const reminders = []
  const now = new Date()

  const oneDay = new Date(startTime)
  oneDay.setHours(oneDay.getHours() - 24)
  if (oneDay > now) {
    reminders.push({ type: 'email', time: oneDay, sent: false })
  }

  const oneHour = new Date(startTime)
  oneHour.setHours(oneHour.getHours() - 1)
  if (oneHour > now) {
    reminders.push({ type: 'email', time: oneHour, sent: false })
  }

  return reminders
}

/**
 * Validate booking time rules.
 *
 * @param {Date} startTime
 * @param {Date} endTime
 */
function validateSchedule(startTime, endTime) {
  if (endTime <= startTime) {
    throw new BookingError(
      'End time must be after start time.',
      'INVALID_TIME_RANGE'
    )
  }

  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
  if (durationMinutes < 15) {
    throw new BookingError(
      'Booking duration must be at least 15 minutes.',
      'BOOKING_TOO_SHORT'
    )
  }

  if (durationMinutes > 8 * 60) {
    throw new BookingError(
      'Booking duration cannot exceed 8 hours.',
      'BOOKING_TOO_LONG'
    )
  }
}

/**
 * Map a store item to a UI-friendly booking object.
 *
 * @param {Record<string, any>|null} booking
 * @returns {Record<string, any>|null}
 */
function normalizeBooking(booking) {
  if (!booking) return null

  return {
    ...booking,
    id: booking.id || booking.bookingId || null,
  }
}

/**
 * Create booking services using the root store and generated collection actions.
 *
 * @param {object} [options]
 * @param {ReturnType<typeof useAppStore>} [options.store]
 * @returns {object}
 */
export function createBookingServices({ store = useAppStore() } = {}) {
  const actions = resolveBookingActions(store)

  /**
   * Get the current user from the root store.
   *
   * @returns {Record<string, any>|null}
   */
  function getCurrentUser() {
    return store.currentUser || store.currentUser?.value || null
  }

  /**
   * Ensure the user is authenticated.
   *
   * @returns {Record<string, any>}
   */
  function requireUser() {
    const user = getCurrentUser()

    if (!user?.uid) {
      throw new BookingError('Authentication required.', 'AUTH_REQUIRED')
    }

    return user
  }

  /**
   * Fetch a page of bookings.
   *
   * @param {object} [params]
   * @returns {Promise<object>}
   */
  async function list(params = {}) {
    if (typeof actions.fetchInitialPage === 'function') {
      return actions.fetchInitialPage(params)
    }

    if (typeof actions.list === 'function') {
      return actions.list(params)
    }

    throw new BookingError(
      'Booking listing is not supported by the current action adapter.',
      'LIST_NOT_SUPPORTED'
    )
  }

  /**
   * Read a booking by id.
   *
   * @param {string} bookingId
   * @returns {Promise<object|null>}
   */
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

  /**
   * Create a booking.
   *
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async function create(payload) {
    const user = requireUser()
    const startTime = toDate(payload.startTime)
    const endTime = toDate(payload.endTime)

    validateSchedule(startTime, endTime)

    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

    const record = {
      bookingNumber: payload.bookingNumber || createBookingNumber(),
      clientId: payload.clientId || user.uid,
      customerName: payload.customerName || payload.title || 'Booking Customer',
      customerEmail: payload.customerEmail || user.email || '',
      customerPhone: payload.customerPhone || '',
      resourceId: payload.resourceId || '',
      resourceType: payload.resourceType || '',
      title: payload.title || 'New Booking',
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
      status: payload.status || 'pending',
      amount: Number(payload.amount || 0),
      currency: payload.currency || 'USD',
      paymentStatus: payload.paymentStatus || 'pending',
      attendees: Array.isArray(payload.attendees) ? payload.attendees : [],
      reminders: buildReminders(startTime),
      createdBy: user.uid,
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

  /**
   * Update a booking.
   *
   * @param {string} bookingId
   * @param {object} updates
   * @returns {Promise<object>}
   */
  async function update(bookingId, updates) {
    if (!bookingId) {
      throw new BookingError('Booking id is required.', 'BOOKING_ID_REQUIRED')
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

  /**
   * Cancel a booking.
   *
   * @param {string} bookingId
   * @param {string} [reason]
   * @returns {Promise<object>}
   */
  async function cancel(bookingId, reason = '') {
    const user = requireUser()

    return update(bookingId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: user.uid,
      cancellationReason: reason,
    })
  }

  /**
   * Confirm a booking.
   *
   * @param {string} bookingId
   * @returns {Promise<object>}
   */
  async function confirm(bookingId) {
    const user = requireUser()

    return update(bookingId, {
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: user.uid,
    })
  }

  /**
   * Mark a booking as checked in.
   *
   * @param {string} bookingId
   * @returns {Promise<object>}
   */
  async function checkIn(bookingId) {
    return update(bookingId, {
      status: 'checked_in',
      checkedInAt: new Date(),
    })
  }

  /**
   * Complete a booking and optionally attach feedback.
   *
   * @param {string} bookingId
   * @param {object} [payload]
   * @returns {Promise<object>}
   */
  async function complete(bookingId, payload = {}) {
    return update(bookingId, {
      status: 'completed',
      checkedOutAt: new Date(),
      rating: payload.rating,
      feedback: payload.feedback,
    })
  }

  return {
    list,
    getById,
    create,
    update,
    cancel,
    confirm,
    checkIn,
    complete,
  }
}

export default createBookingServices
