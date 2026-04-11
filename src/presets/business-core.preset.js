/**
 * @file business-core.preset.js
 * @description Core business preset with CRM, forms, dashboard, and essential features.
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  id: 'business-core',
  name: 'Business Core',
  description: 'Complete business foundation with CRM, forms, dashboard, and core features',
  version: '1.0.0',
  
  apps: [
    'crm',           // Customer relationship management
    'forms',         // Form builder and submissions
    'dashboard',     // Admin dashboard with widgets
    'client-records' // Client records management
  ],
  
  features: [
    'auth',          // User authentication
    'rbac',          // Role-based access control
    'analytics',     // Analytics tracking
    'notifications', // Notification system
    'audit-logs'     // Activity logging
  ],
  
  // Optional configuration overrides
  config: {
    branding: {
      appName: 'Business Core Platform',
      description: 'Complete business management solution'
    },
    firestore: {
      collections: ['clients', 'forms', 'submissions', 'activities']
    }
  },
  
  // Dependencies to install
  dependencies: [
    'vue-chartjs',
    'vue-flatpickr',
    'vue-advanced-cropper'
  ]
};