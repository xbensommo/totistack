/**
 * @file app.manifest.js
 * @description Declarative manifest for the Client Records Totistack app.
 */

export default {
  id: 'client-records',
  type: 'app',
  name: 'Client Records',
  version: '3.0.0',
  description:
    'Centralized client records with contacts, activities, notes, and reusable UI starters.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: [],
  },
  navigation: {
    label: 'Clients',
    icon: 'Users',
    priority: 20,
    requiresAuth: true,
    roles: ['admin', 'manager', 'agent'],
  },
  collections: ['clients', 'clientContacts', 'clientActivities', 'clientNotes'],
}
