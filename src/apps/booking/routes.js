/**
 * @file booking/routes.js
 * @description Declarative route records for the Booking app.
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
      requiresAuth: false,
      feature: 'booking',
      publicAccess: true,
      title: 'Book Now',
    },
  },
  {
    path: '/book',
    name: 'PublicBookingCreate',
    component: () => import('./pages/BookingCreatePage.vue'),
    meta: {
      requiresAuth: false,
      feature: 'booking',
      publicAccess: true,
      title: 'Make a Booking',
    },
  },
  {
    path: '/bookings/manage',
    name: 'BookingLookup',
    component: () => import('./pages/BookingLookupPage.vue'),
    meta: {
      requiresAuth: false,
      feature: 'booking',
      publicAccess: true,
      title: 'Manage Booking',
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
