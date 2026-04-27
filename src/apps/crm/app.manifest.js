/**
 * @file apps/crm/app.manifest.js
 * @description Declarative CRM manifest aligned with the latest Totistack assembly flow.
 */

export default {
  id: 'crm',
  name: 'CRM',
  version: '3.2.0',
  description: 'Customer relationship management for leads, contacts, accounts, pipeline, tasks, documents, communication logs, and customer history.',
  provider: 'firestore',
  usesFirestore: true,
  dependencies: {
    features: ['auth', 'rbac', 'notifications'],
    apps: ['client-records'],
  },
  navigation: {
    icon: 'Building2',
    priority: 1,
    roles: ['admin', 'sysadmin', 'receptionist', 'consultant', 'consultant-editor'],
  },
  collections: [
    'crm_leads',
    'crm_contacts',
    'crm_accounts',
    'crm_opportunities',
    'crm_tasks',
    'crm_activities',
    'crm_notes',
    'crm_documents',
    'crm_messages',
    'crm_attachments',
    'crm_saved_views',
    'crm_automation_rules',
    'crm_assignment_rules',
  ],
  capabilities: [
    'totisoft-leads',
    'crm-workflows',
    'action-modal-guarded-operations',
    'notification-aware',
  ],
};
