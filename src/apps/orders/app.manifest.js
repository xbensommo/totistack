/**
 * @file orders/app.manifest.js
 * @description Declarative Orders app manifest aligned with the latest Totistack assembly flow.
 */

import { ORDER_PERMISSIONS } from './permissions.js'

export default {
  id: 'orders',
  type: 'app',
  name: 'Orders System',
  version: '4.0.0',
  description: 'Business-ready order operations for carts, checkout, invoicing, fulfillment, and customer history.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: ['client-records'],
  },
  businessProfiles: ['generic', 'totisoft', 'eduprolic'],
  navigation: {
    icon: 'ShoppingCart',
    label: 'Orders',
    priority: 30,
    permission: ORDER_PERMISSIONS.VIEW,
    roles: ['admin', 'manager', 'receptionist', 'consultant', 'user'],
  },
  collections: ['orders'],
}
