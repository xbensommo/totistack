/**
 * Bookings Collection Definition
 * @module apps/booking/collections/bookings
 * @description Collection definition for bookings with normalized schema
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'bookings',
  description: 'Booking appointments and reservations',
  
  schema: {
    id: { type: 'string', required: true, description: 'Booking unique identifier' },
    bookingNumber: { type: 'string', required: true, unique: true, description: 'Human-readable booking number' },
    clientId: { type: 'string', required: true, references: 'clients', description: 'Reference to client' },
    userId: { type: 'string', required: true, references: 'users', description: 'User who created booking' },
    
    // Resource information
    resourceId: { type: 'string', required: true, references: 'resources', description: 'Booked resource' },
    resourceType: { type: 'string', required: true, description: 'Type of resource (room, equipment, staff, etc.)' },
    
    // Time slots
    startTime: { type: 'date', required: true, description: 'Booking start time' },
    endTime: { type: 'date', required: true, description: 'Booking end time' },
    duration: { type: 'number', required: true, description: 'Duration in minutes' },
    timezone: { type: 'string', default: 'UTC', description: 'Timezone of booking' },
    
    // Booking status workflow
    status: {
      type: 'string',
      required: true,
      enum: ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      description: 'Current booking status'
    },
    
    // Payment information
    amount: { type: 'number', required: true, min: 0, description: 'Booking amount' },
    currency: { type: 'string', default: 'USD', description: 'Currency code' },
    paymentStatus: {
      type: 'string',
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      description: 'Payment status'
    },
    paymentId: { type: 'string', description: 'Payment reference' },
    
    // Attendee information
    attendees: {
      type: 'array',
      description: 'List of attendees',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          type: { type: 'string', enum: ['primary', 'guest'] }
        }
      }
    },
    
    // Booking details
    title: { type: 'string', required: true, description: 'Booking title' },
    description: { type: 'string', description: 'Booking description' },
    notes: { type: 'string', description: 'Additional notes' },
    specialRequests: { type: 'string', description: 'Special requests from client' },
    
    // Confirmation data
    confirmedAt: { type: 'date', description: 'Confirmation timestamp' },
    confirmedBy: { type: 'string', references: 'users', description: 'User who confirmed' },
    confirmationSent: { type: 'boolean', default: false, description: 'Confirmation email sent' },
    
    // Reminder configuration
    reminders: {
      type: 'array',
      description: 'Scheduled reminders',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['email', 'sms', 'push'] },
          time: { type: 'date' },
          sent: { type: 'boolean', default: false }
        }
      }
    },
    
    // Cancellation data
    cancelledAt: { type: 'date', description: 'Cancellation timestamp' },
    cancelledBy: { type: 'string', references: 'users', description: 'User who cancelled' },
    cancellationReason: { type: 'string', description: 'Reason for cancellation' },
    cancellationFee: { type: 'number', default: 0, description: 'Cancellation fee charged' },
    
    // Check-in/out data
    checkedInAt: { type: 'date', description: 'Check-in timestamp' },
    checkedOutAt: { type: 'date', description: 'Check-out timestamp' },
    
    // Rating and feedback
    rating: { type: 'number', min: 1, max: 5, description: 'Client rating' },
    feedback: { type: 'string', description: 'Client feedback' },
    
    // Timestamps
    createdAt: { type: 'date', required: true, description: 'Creation timestamp' },
    updatedAt: { type: 'date', required: true, description: 'Last update timestamp' }
  },
  
  indexes: [
    { fields: ['bookingNumber'], unique: true },
    { fields: ['clientId', 'startTime'] },
    { fields: ['resourceId', 'startTime', 'endTime'] },
    { fields: ['status', 'startTime'] },
    { fields: ['startTime'], order: 'desc' }
  ],
  
  hooks: {
    beforeCreate: ['validateAvailability', 'calculateDuration', 'generateBookingNumber'],
    afterCreate: ['sendConfirmation', 'scheduleReminders'],
    beforeUpdate: ['validateStatusTransition', 'checkAvailabilityIfReschedule']
  },
  
  security: {
    read: { roles: ['admin', 'manager'], owners: ['userId', 'clientId'] },
    write: { roles: ['admin', 'manager'] },
    delete: { roles: ['admin'] }
  }
};