/**
 * @file internal-ops.preset.js
 * @description Internal operations preset with CRM, CMS, and workflows.
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  id: 'internal-ops',
  name: 'Internal Operations',
  description: 'Internal operations management with CRM, CMS, and workflow automation',
  version: '1.0.0',
  
  apps: [
    'client-records'
    //'crm',           // Customer management
    /*'workflows',     // Workflow engine*/
    //'dashboard'      // Operations dashboard
  ],
  
  features: [
    'auth',          // User authentication
    'rbac',
    'database-manager'
    /*'audit-logs',    // Activity logging
    'analytics'      // Operational analytics*/
  ],
  
  config: {
    branding: {
      appName: 'Internal Operations Platform',
      description: 'Complete internal operations management'
    },
    firestore: {
      collections: ['employees', 'departments', 'tasks', 'projects', 'documents']
    }
  },
  
  dependencies: [
    'vue-advanced-chat',
    'vue-draggable',
    'vue-json-viewer'
  ]
};