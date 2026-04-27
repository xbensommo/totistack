/**
 * @file crm/manifest.js
 * @description Declarative CRM app manifest for Totistack generated assembly.
 */

export default {
  id: 'crm',
  type: 'app',
  name: 'CRM',
  version: '3.1.0',
  description: 'Customer relationship management for leads, contacts, companies, tasks, documents, communication logging, workflow rules, and reporting.',
  dependencies: {
    features: ['auth', 'rbac'],
  },
  navigation: {
    label: 'CRM',
    icon: 'Building2',
    priority: 20,
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
};
