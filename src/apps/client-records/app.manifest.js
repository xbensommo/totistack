/**
 * Client Records App Manifest
 * @module apps/client-records
 * @description Client relationship management with normalized data schema
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'client-records',
  name: 'Client Records',
  version: '2.0.0',
  description: 'Comprehensive client management with normalized relational data structure',
  
  dependencies: {
    features: ['auth', 'rbac', 'media'],
    apps: []
  },
  
  navigation: {
    icon: 'Users',
    priority: 1,
    roles: ['admin', 'manager']
  },
  
  collections: [
    'clients',
    'clientContacts',
    'clientAddresses',
    'clientPreferences',
    'clientNotes',
    'clientActivities',
    'clientSegments',
    'clientTags'
  ],
  
  routes: [
    { path: '/clients', name: 'clients', component: 'ClientsListPage', meta: { requiresAuth: true } },
    { path: '/clients/:id', name: 'client-detail', component: 'ClientDetailPage', meta: { requiresAuth: true } },
    { path: '/clients/:id/edit', name: 'client-edit', component: 'ClientEditPage', meta: { requiresAuth: true, permissions: ['client:update'] } },
    { path: '/clients/new', name: 'client-create', component: 'ClientCreatePage', meta: { requiresAuth: true, permissions: ['client:create'] } },
    { path: '/segments', name: 'segments', component: 'SegmentsPage', meta: { requiresAuth: true, permissions: ['segment:read'] } }
  ],
  
  hooks: ['onClientCreated', 'onClientUpdated', 'onClientMerged', 'onActivityLogged']
};