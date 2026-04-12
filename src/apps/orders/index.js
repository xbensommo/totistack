/**
 * @file orders/index.js
 * @description Public entry point for the Orders app.
 */

import manifest from './app.manifest.js'
import routes from './routes.js'
import { createOrderServices } from './services/orderService.js'

export { manifest, routes, createOrderServices }

export default {
  manifest,
  routes,
  createServices: createOrderServices,
}
