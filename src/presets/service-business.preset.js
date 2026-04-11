/**
 * @file service-business.preset.js
 * @description Service business preset with booking, messaging, and payments.
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  id: 'service-business',
  name: 'Service Business',
  description: 'Perfect for service-based businesses with booking, messaging, and payments',
  version: '1.0.0',
  
  apps: [
    'booking-platform', // Appointment scheduling
    'messaging',        // Client communication
    'payments',         // Payment processing
    'notifications'     // Notification center
  ],
  
  features: [
    'auth',           // User authentication
    'workflows',      // Workflow automation
    'search',         // Search functionality
    'media'           // Media management
  ],
  
  config: {
    branding: {
      appName: 'Service Business Suite',
      description: 'Complete service business management'
    },
    firestore: {
      collections: ['bookings', 'services', 'staff', 'clients', 'payments']
    }
  },
  
  dependencies: [
    '@stripe/stripe-js',
    'date-fns',
    'vue-calendar'
  ]
};