/**
 * @file apps/crm/app.manifest.js
 * @description Declarative CRM manifest aligned with the latest Totistack assembly flow.
 *
 * Notes:
 * - This manifest declares only the collections and navigation owned by this CRM module.
 * - Concrete route records live in ./routes.js so the generated router can consume real components.
 * - Auth and RBAC are handled by the root application store and access runtime.
 */

export default {
  id: 'crm',
  name: 'CRM',
  version: '3.0.0',
  description: 'Customer relationship management for leads, opportunities, pipeline, and activity timelines.',
  provider: 'firestore',
  usesFirestore: true,
  dependencies: {
    features: ['auth', 'rbac'],
    apps: ['client-records'],
  },
  navigation: {
    icon: 'Building2',
    priority: 1,
    roles: ['admin', 'manager', 'sales'],
  },
  collections: ['crm_leads', 'crm_opportunities', 'crm_activities'],
};
