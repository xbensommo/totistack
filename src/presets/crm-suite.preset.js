/**
 * @file crm-suite.preset.js
 * @description Complete CRM suite with sales, marketing, and customer support.
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  id: 'crm-suite',
  name: 'CRM Suite',
  description: 'Complete CRM solution with sales, marketing, and customer support features',
  version: '1.0.0',
  
  apps: [
    'crm',           // Core CRM
    'messaging',     // Client communication
    'dashboard',     // Sales dashboard
    'notifications', // Alerts and notifications
    'forms'          // Lead capture forms
  ],
  
  features: [
    'auth',          // User authentication
    'rbac',          // Permission management
    'analytics',     // Sales analytics
    'workflows',     // Automation workflows
    'search',        // Advanced search
    'audit-logs'     // Activity tracking
  ],
  
  config: {
    branding: {
      appName: 'CRM Suite',
      description: 'Complete customer relationship management'
    },
    firestore: {
      collections: [
        'leads',
        'contacts',
        'accounts',
        'opportunities',
        'activities',
        'tasks',
        'campaigns'
      ]
    }
  },
  
  dependencies: [
    'vue-calendar',
    'vue-chartjs',
    'vue-advanced-chat',
    'vue-flatpickr'
  ]
};