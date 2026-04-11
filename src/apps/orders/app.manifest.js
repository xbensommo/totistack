/**
 * Orders App Manifest
 * @module apps/orders
 * @description Orders management system for e-commerce and transaction processing
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'orders',
  name: 'Orders System',
  version: '2.0.0',
  description: 'Complete order management with carts, checkout, and fulfillment',
  
  dependencies: {
    features: ['auth', 'rbac', 'media', 'integrations'],
    apps: ['client-records']
  },
  
  navigation: {
    icon: 'ShoppingCart',
    priority: 2,
    roles: ['admin', 'manager', 'user']
  },
  
  collections: ['orders', 'orderItems', 'carts', 'payments', 'shipments', 'refunds'],
  
  routes: [
    { path: '/orders', name: 'orders', component: 'OrdersListPage', meta: { requiresAuth: true } },
    { path: '/orders/:id', name: 'order-detail', component: 'OrderDetailPage', meta: { requiresAuth: true } },
    { path: '/cart', name: 'cart', component: 'CartPage', meta: { requiresAuth: true } },
    { path: '/checkout', name: 'checkout', component: 'CheckoutPage', meta: { requiresAuth: true } },
    { path: '/orders/:id/invoice', name: 'invoice', component: 'InvoicePage', meta: { requiresAuth: true } }
  ],
  
  hooks: ['onOrderCreated', 'onOrderStatusChanged', 'onPaymentReceived']
};