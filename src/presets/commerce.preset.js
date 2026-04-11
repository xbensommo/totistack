/**
 * @file commerce.preset.js
 * @description E-commerce preset with catalog, payments, and CMS.
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  id: 'commerce',
  name: 'E-Commerce Suite',
  description: 'Complete e-commerce solution with catalog, payments, and content management',
  version: '1.0.0',
  
  apps: [
    'catalog',       // Product catalog
    'payments',      // Payment processing
    'cms',           // Content management
    'forms'          // Form builder for reviews/feedback
  ],
  
  features: [
    'auth',          // User authentication
    'search',        // Product search
    'analytics',     // Sales analytics
    'media'          // Product media management
  ],
  
  config: {
    branding: {
      appName: 'E-Commerce Platform',
      description: 'Complete online store solution'
    },
    firestore: {
      collections: ['products', 'categories', 'orders', 'customers', 'reviews']
    }
  },
  
  dependencies: [
    '@stripe/stripe-js',
    'vue-slider-component',
    'vuelidate'
  ]
};