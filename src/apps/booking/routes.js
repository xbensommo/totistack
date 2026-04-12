/**
 * @file booking/routes.js
 * @description Declarative route records for the Booking app.
 *
 * The root router should import these records through the generated route registry.
 */

const routes = [
  {
    path: '/bookings',
    name: 'BookingsList',
    component: () => import('./pages/BookingsListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'booking',
      roles: ['admin', 'manager', 'user'],
      title: 'Bookings',
    },
  },
  {
    path: '/bookings/calendar',
    name: 'BookingCalendar',
    component: () => import('./pages/BookingCalendarPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'booking',
      roles: ['admin', 'manager', 'user'],
      title: 'Booking Calendar',
    },
  },
  {
    path: '/bookings/new',
    name: 'BookingCreate',
    component: () => import('./pages/BookingCreatePage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'booking',
      roles: ['admin', 'manager'],
      title: 'Create Booking',
    },
  },
  {
    path: '/bookings/:id',
    name: 'BookingDetail',
    component: () => import('./pages/BookingDetailPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'booking',
      roles: ['admin', 'manager', 'user'],
      title: 'Booking Details',
    },
  },
]

export default routes
