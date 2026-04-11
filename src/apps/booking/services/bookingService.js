/**
 * Booking Service
 * @module apps/booking/services/bookingService
 * @description Core service for booking and reservation management
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Booking Service Class
 */
export class BookingService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Booking cache */
  #cache = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {BookingService} BookingService instance
   */
  static getInstance() {
    if (!globalThis.__bookingService) {
      globalThis.__bookingService = new BookingService();
    }
    return globalThis.__bookingService;
  }
  
  /**
   * Initialize booking service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService) {
    if (this.#initialized) {
      return;
    }
    
    try {
      this.#authService = authService;
      this.#config = {
        bookingPrefix: 'BKG',
        cancellationWindow: 24, // Hours before booking
        cancellationFeePercent: 0,
        autoConfirm: false,
        minAdvanceHours: 1,
        maxAdvanceDays: 90,
        ...config
      };
      
      this.#initialized = true;
      console.info('[BookingService] Initialized');
      
    } catch (error) {
      console.error('[BookingService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Created booking
   */
  async createBooking(bookingData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      // Parse dates
      const startTime = new Date(bookingData.startTime);
      const endTime = new Date(bookingData.endTime);
      
      // Validate dates
      this.#validateBookingDates(startTime, endTime);
      
      // Check availability
      const isAvailable = await this.checkAvailability(
        bookingData.resourceId,
        startTime,
        endTime
      );
      
      if (!isAvailable) {
        throw new Error('RESOURCE_NOT_AVAILABLE');
      }
      
      // Calculate duration
      const duration = (endTime - startTime) / (1000 * 60);
      
      // Generate booking number
      const bookingNumber = await this.#generateBookingNumber();
      
      const bookingId = this.#generateId();
      const now = Timestamp.now();
      
      const booking = {
        id: bookingId,
        bookingNumber,
        clientId: bookingData.clientId || user.uid,
        userId: user.uid,
        resourceId: bookingData.resourceId,
        resourceType: bookingData.resourceType,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        duration,
        timezone: bookingData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: this.#config.autoConfirm ? 'confirmed' : 'pending',
        amount: bookingData.amount || 0,
        currency: bookingData.currency || 'USD',
        paymentStatus: 'pending',
        attendees: bookingData.attendees || [{ name: user.displayName, email: user.email, type: 'primary' }],
        title: bookingData.title,
        description: bookingData.description,
        notes: bookingData.notes,
        specialRequests: bookingData.specialRequests,
        reminders: this.#generateReminders(startTime),
        createdAt: now,
        updatedAt: now
      };
      
      // Save to Firestore
      const bookingRef = doc(this.#db, 'bookings', bookingId);
      await setDoc(bookingRef, booking);
      
      // Invalidate availability cache
      this.#cache.clear();
      
      console.info(`[BookingService] Booking created: ${bookingNumber}`);
      
      // Trigger hooks
      await this.#onBookingCreated(booking);
      
      // Auto-confirm if configured
      if (this.#config.autoConfirm) {
        await this.confirmBooking(bookingId);
      }
      
      return booking;
      
    } catch (error) {
      console.error('[BookingService] Create booking failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Check resource availability
   * @param {string} resourceId - Resource ID
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @param {string} excludeBookingId - Booking ID to exclude (for updates)
   * @returns {Promise<boolean>} Availability status
   */
  async checkAvailability(resourceId, startTime, endTime, excludeBookingId = null) {
    try {
      // Query overlapping bookings
      const q = query(
        collection(this.#db, 'bookings'),
        where('resourceId', '==', resourceId),
        where('status', 'not-in', ['cancelled', 'no_show']),
        where('startTime', '<', Timestamp.fromDate(endTime)),
        where('endTime', '>', Timestamp.fromDate(startTime))
      );
      
      const snapshot = await getDocs(q);
      
      // Filter out excluded booking if updating
      const overlapping = snapshot.docs.filter(doc => {
        if (excludeBookingId && doc.id === excludeBookingId) {
          return false;
        }
        const booking = doc.data();
        return booking.status !== 'cancelled';
      });
      
      return overlapping.length === 0;
      
    } catch (error) {
      console.error('[BookingService] Availability check failed:', error);
      throw error;
    }
  }
  
  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object|null>} Booking object
   */
  async getBooking(bookingId) {
    try {
      if (this.#cache.has(bookingId)) {
        return this.#cache.get(bookingId);
      }
      
      const bookingRef = doc(this.#db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        return null;
      }
      
      const booking = bookingDoc.data();
      this.#cache.set(bookingId, booking);
      
      return booking;
      
    } catch (error) {
      console.error('[BookingService] Get booking failed:', error);
      throw error;
    }
  }
  
  /**
   * List bookings with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated bookings
   */
  async listBookings(options = {}) {
    try {
      const {
        clientId = null,
        resourceId = null,
        status = null,
        startDate = null,
        endDate = null,
        limit: pageSize = 20,
        startAfter = null,
        orderBy: orderField = 'startTime',
        orderDirection = 'asc'
      } = options;
      
      let constraints = [];
      
      if (clientId) {
        constraints.push(where('clientId', '==', clientId));
      }
      
      if (resourceId) {
        constraints.push(where('resourceId', '==', resourceId));
      }
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      if (startDate) {
        constraints.push(where('startTime', '>=', Timestamp.fromDate(startDate)));
      }
      
      if (endDate) {
        constraints.push(where('startTime', '<=', Timestamp.fromDate(endDate)));
      }
      
      constraints.push(orderBy(orderField, orderDirection));
      
      if (startAfter) {
        const cursorDoc = await getDoc(doc(this.#db, 'bookings', startAfter));
        if (cursorDoc.exists()) {
          constraints.push(startAfter(cursorDoc));
        }
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'bookings'), ...constraints);
      const snapshot = await getDocs(q);
      
      const bookings = [];
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        items: bookings,
        pagination: {
          limit: pageSize,
          hasMore: bookings.length === pageSize,
          nextCursor: bookings.length ? bookings[bookings.length - 1].id : null
        }
      };
      
    } catch (error) {
      console.error('[BookingService] List bookings failed:', error);
      throw error;
    }
  }
  
  /**
   * Get bookings for calendar view
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Array} resourceIds - Filter by resource IDs
   * @returns {Promise<Array>} Calendar events
   */
  async getCalendarEvents(startDate, endDate, resourceIds = null) {
    try {
      let constraints = [
        where('startTime', '<=', Timestamp.fromDate(endDate)),
        where('endTime', '>=', Timestamp.fromDate(startDate)),
        where('status', 'not-in', ['cancelled', 'no_show'])
      ];
      
      if (resourceIds && resourceIds.length > 0) {
        constraints.push(where('resourceId', 'in', resourceIds));
      }
      
      const q = query(collection(this.#db, 'bookings'), ...constraints);
      const snapshot = await getDocs(q);
      
      const events = [];
      snapshot.forEach(doc => {
        const booking = doc.data();
        events.push({
          id: doc.id,
          title: booking.title,
          start: booking.startTime.toDate(),
          end: booking.endTime.toDate(),
          resourceId: booking.resourceId,
          status: booking.status,
          color: this.#getStatusColor(booking.status),
          extendedProps: {
            bookingNumber: booking.bookingNumber,
            clientId: booking.clientId,
            attendees: booking.attendees,
            amount: booking.amount
          }
        });
      });
      
      return events;
      
    } catch (error) {
      console.error('[BookingService] Get calendar events failed:', error);
      throw error;
    }
  }
  
  /**
   * Confirm booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  async confirmBooking(bookingId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }
      
      if (booking.status !== 'pending') {
        throw new Error('BOOKING_ALREADY_CONFIRMED_OR_CANCELLED');
      }
      
      const updates = {
        status: 'confirmed',
        confirmedAt: Timestamp.now(),
        confirmedBy: user.uid,
        confirmationSent: false,
        updatedAt: Timestamp.now()
      };
      
      const bookingRef = doc(this.#db, 'bookings', bookingId);
      await updateDoc(bookingRef, updates);
      
      this.#cache.delete(bookingId);
      
      console.info(`[BookingService] Booking confirmed: ${booking.bookingNumber}`);
      
      // Trigger confirmation hook
      await this.#onBookingConfirmed(booking);
      
      return this.getBooking(bookingId);
      
    } catch (error) {
      console.error('[BookingService] Confirm booking failed:', error);
      throw error;
    }
  }
  
  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelBooking(bookingId, reason = '') {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }
      
      if (booking.status === 'cancelled') {
        throw new Error('BOOKING_ALREADY_CANCELLED');
      }
      
      if (booking.status === 'completed') {
        throw new Error('BOOKING_ALREADY_COMPLETED');
      }
      
      // Calculate cancellation fee if applicable
      const startTime = booking.startTime.toDate();
      const hoursUntilStart = (startTime - new Date()) / (1000 * 60 * 60);
      const cancellationFee = hoursUntilStart < this.#config.cancellationWindow
        ? booking.amount * (this.#config.cancellationFeePercent / 100)
        : 0;
      
      const updates = {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancelledBy: user.uid,
        cancellationReason: reason,
        cancellationFee,
        updatedAt: Timestamp.now()
      };
      
      const bookingRef = doc(this.#db, 'bookings', bookingId);
      await updateDoc(bookingRef, updates);
      
      this.#cache.delete(bookingId);
      
      console.info(`[BookingService] Booking cancelled: ${booking.bookingNumber}`);
      
      // Process refund if applicable
      if (cancellationFee < booking.amount && booking.paymentStatus === 'paid') {
        await this.#processCancellationRefund(booking, cancellationFee);
      }
      
      // Trigger cancellation hook
      await this.#onBookingCancelled(booking, reason);
      
      return {
        success: true,
        bookingId,
        cancellationFee,
        refundAmount: booking.amount - cancellationFee
      };
      
    } catch (error) {
      console.error('[BookingService] Cancel booking failed:', error);
      throw error;
    }
  }
  
  /**
   * Check in for booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  async checkIn(bookingId) {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }
      
      if (booking.status !== 'confirmed') {
        throw new Error('BOOKING_NOT_CONFIRMED');
      }
      
      const updates = {
        status: 'checked_in',
        checkedInAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const bookingRef = doc(this.#db, 'bookings', bookingId);
      await updateDoc(bookingRef, updates);
      
      this.#cache.delete(bookingId);
      
      return this.getBooking(bookingId);
      
    } catch (error) {
      console.error('[BookingService] Check in failed:', error);
      throw error;
    }
  }
  
  /**
   * Complete booking
   * @param {string} bookingId - Booking ID
   * @param {Object} feedback - Feedback data
   * @returns {Promise<Object>} Updated booking
   */
  async completeBooking(bookingId, feedback = {}) {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }
      
      const updates = {
        status: 'completed',
        checkedOutAt: Timestamp.now(),
        rating: feedback.rating,
        feedback: feedback.comment,
        updatedAt: Timestamp.now()
      };
      
      const bookingRef = doc(this.#db, 'bookings', bookingId);
      await updateDoc(bookingRef, updates);
      
      this.#cache.delete(bookingId);
      
      return this.getBooking(bookingId);
      
    } catch (error) {
      console.error('[BookingService] Complete booking failed:', error);
      throw error;
    }
  }
  
  /**
   * Validate booking dates
   * @private
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @throws {Error} If dates are invalid
   */
  #validateBookingDates(startTime, endTime) {
    const now = new Date();
    const minStart = new Date(now.getTime() + this.#config.minAdvanceHours * 60 * 60 * 1000);
    const maxStart = new Date(now.getTime() + this.#config.maxAdvanceDays * 24 * 60 * 60 * 1000);
    
    if (startTime < minStart) {
      throw new Error('BOOKING_TOO_SOON');
    }
    
    if (startTime > maxStart) {
      throw new Error('BOOKING_TOO_FAR');
    }
    
    if (endTime <= startTime) {
      throw new Error('INVALID_TIME_RANGE');
    }
    
    const duration = (endTime - startTime) / (1000 * 60);
    if (duration < 15) {
      throw new Error('BOOKING_TOO_SHORT');
    }
    
    if (duration > 480) {
      throw new Error('BOOKING_TOO_LONG');
    }
  }
  
  /**
   * Generate booking number
   * @private
   */
  async #generateBookingNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const q = query(
      collection(this.#db, 'bookings'),
      where('createdAt', '>=', Timestamp.fromDate(new Date(year, month - 1, day))),
      where('createdAt', '<', Timestamp.fromDate(new Date(year, month - 1, day + 1)))
    );
    
    const snapshot = await getDocs(q);
    const sequence = String(snapshot.size + 1).padStart(4, '0');
    
    return `${this.#config.bookingPrefix}-${year}${month}${day}-${sequence}`;
  }
  
  /**
   * Generate reminders based on booking time
   * @private
   */
  #generateReminders(startTime) {
    const reminders = [];
    const startDate = startTime instanceof Date ? startTime : startTime.toDate();
    
    // 24 hours before
    const dayBefore = new Date(startDate);
    dayBefore.setHours(dayBefore.getHours() - 24);
    if (dayBefore > new Date()) {
      reminders.push({
        type: 'email',
        time: Timestamp.fromDate(dayBefore),
        sent: false
      });
    }
    
    // 1 hour before
    const hourBefore = new Date(startDate);
    hourBefore.setHours(hourBefore.getHours() - 1);
    if (hourBefore > new Date()) {
      reminders.push({
        type: 'email',
        time: Timestamp.fromDate(hourBefore),
        sent: false
      });
    }
    
    return reminders;
  }
  
  /**
   * Get status color for calendar
   * @private
   */
  #getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      checked_in: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#6b7280',
      cancelled: '#ef4444',
      no_show: '#dc2626'
    };
    return colors[status] || '#6b7280';
  }
  
  /**
   * Process cancellation refund
   * @private
   */
  async #processCancellationRefund(booking, cancellationFee) {
    // Implementation would call payment provider
    console.info(`[BookingService] Processing refund for booking ${booking.bookingNumber}, fee: ${cancellationFee}`);
  }
  
  /**
   * Handle booking creation hooks
   * @private
   */
  async #onBookingCreated(booking) {
    // Send confirmation email
    // Schedule reminders
    // Trigger analytics
    console.info(`[BookingService] Booking created hook: ${booking.bookingNumber}`);
  }
  
  /**
   * Handle booking confirmation hooks
   * @private
   */
  async #onBookingConfirmed(booking) {
    // Send confirmation email
    // Update calendar
    console.info(`[BookingService] Booking confirmed hook: ${booking.bookingNumber}`);
  }
  
  /**
   * Handle booking cancellation hooks
   * @private
   */
  async #onBookingCancelled(booking, reason) {
    // Send cancellation email
    // Free up resource
    console.info(`[BookingService] Booking cancelled hook: ${booking.bookingNumber}`);
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId() {
    return `bkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'RESOURCE_NOT_AVAILABLE': 'Resource is not available for the selected time',
      'BOOKING_NOT_FOUND': 'Booking not found',
      'BOOKING_ALREADY_CONFIRMED_OR_CANCELLED': 'Booking cannot be confirmed',
      'BOOKING_ALREADY_CANCELLED': 'Booking is already cancelled',
      'BOOKING_ALREADY_COMPLETED': 'Cannot cancel completed booking',
      'BOOKING_NOT_CONFIRMED': 'Booking must be confirmed first',
      'BOOKING_TOO_SOON': 'Booking must be made at least 1 hour in advance',
      'BOOKING_TOO_FAR': 'Booking cannot be made more than 90 days in advance',
      'INVALID_TIME_RANGE': 'End time must be after start time',
      'BOOKING_TOO_SHORT': 'Booking duration must be at least 15 minutes',
      'BOOKING_TOO_LONG': 'Booking duration cannot exceed 8 hours'
    };
    
    const message = errorMap[error.message] || error.message || 'BOOKING_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const bookingService = BookingService.getInstance();
export default bookingService;