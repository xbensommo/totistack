/**
 * Booking App Manifest
 * @module apps/booking
 * @description Booking system for appointments, reservations, and resource scheduling
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'booking',
  name: 'Booking System',
  version: '2.0.0',
  description: 'Complete booking management with calendar, availability, and scheduling',
  
  dependencies: {
    features: ['auth', 'rbac', 'media', 'integrations'],
    apps: ['client-records']
  },
  
  navigation: {
    icon: 'Calendar',
    priority: 3,
    roles: ['admin', 'manager', 'user']
  },
  
  collections: ['bookings', 'resources', 'availability', 'bookingHistory', 'reminders'],
  
  routes: [
    { path: '/bookings', name: 'bookings', component: 'BookingsListPage', meta: { requiresAuth: true } },
    { path: '/bookings/calendar', name: 'booking-calendar', component: 'BookingCalendarPage', meta: { requiresAuth: true } },
    { path: '/bookings/:id', name: 'booking-detail', component: 'BookingDetailPage', meta: { requiresAuth: true } },
    { path: '/booking/new', name: 'booking-create', component: 'BookingCreatePage', meta: { requiresAuth: true } }
  ],
  
  hooks: ['onBookingCreated', 'onBookingConfirmed', 'onBookingCancelled', 'onReminderSent']
};
