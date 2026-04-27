/**
 * @file booking/index.js
 * @description Public entry point for the Booking app.
 */

import manifest from './app.manifest.js'
import routes from './routes.js'
import { createBookingServices } from './services/bookingService.js'
import { createBookingActionDefinitions } from './booking.actions.js'

export { manifest, routes, createBookingServices }

export default {
  manifest,
  routes,
  createServices: createBookingServices,
  createActionDefinitions: createBookingActionDefinitions,
}
export { createBookingActionDefinitions }
