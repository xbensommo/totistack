/**
 * @file crm/manifest.js
 * @description Declarative CRM app manifest for Totistack generated assembly.
 */

export default {
  id: 'crm',
  type: 'app',
  name: 'CRM',
  version: '3.0.0',
  description: 'Customer relationship management for leads, opportunities, and activity tracking.',
  dependencies: {
    features: ['auth', 'rbac'],
  },
  navigation: {
    label: 'CRM',
    icon: 'Building2',
    priority: 20,
  },
  collections: ['crm_leads', 'crm_opportunities', 'crm_activities'],
}
