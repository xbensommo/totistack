/**
 * @file booking/app.manifest.js
 * @description Declarative Booking app manifest for the latest Totistack assembly flow.
 *
 * This app is intentionally declarative:
 * - it does not create providers
 * - it does not register routes at runtime
 * - it does not own root auth/rbac state
 *
 * The generator is expected to discover this manifest and assemble the app
 * through src/generated/* registries.
 */

export default {
  id: 'booking',
  type: 'app',
  name: 'Booking System',
  version: '3.0.0',
  description: 'Booking management for appointments, reservations, availability, and scheduling.',
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
