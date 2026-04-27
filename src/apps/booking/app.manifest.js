/**
 * @file booking/app.manifest.js
 * @description Declarative Booking app manifest for the latest Totistack assembly flow.
 */

export default {
  id: 'booking',
  type: 'app',
  name: 'Booking System',
  version: '3.1.0',
  description: 'Booking management for appointments, reservations, guest or authenticated booking intake, reminders, and scheduling operations.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: ['client-records'],
  },
  navigation: {
    icon: 'CalendarDays',
    label: 'Bookings',
    priority: 35,
    roles: ['admin', 'manager', 'user'],
  },
  collections: ['bookings'],
}
