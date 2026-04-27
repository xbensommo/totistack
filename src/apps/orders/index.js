/**
 * @file orders/index.js
 * @description Public entry point for the Orders app.
 */

import manifest from './app.manifest.js'
import routes from './routes.js'
import permissions from './permissions.js'
import { createOrderServices } from './services/orderService.js'
import { ORDER_BUSINESS_PROFILES } from './business/default-profile.js'
import { createOrderActionDefinitions } from './order.actions.js'

export { manifest, routes, permissions, ORDER_BUSINESS_PROFILES, createOrderServices }

export default {
  manifest,
  routes,
  permissions,
  businessProfiles: ORDER_BUSINESS_PROFILES,
  createServices: createOrderServices,
  createActionDefinitions: createOrderActionDefinitions,
}
export { createOrderActionDefinitions }
