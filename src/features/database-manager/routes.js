/**
 * @file src/features/database-manager/routes.js
 * @description Declarative route contribution for the database manager feature.
 */

export default [
  {
    path: '/db-manager',
    name: 'dbmanager.collections',
    component: () => import('./CollectionBrowser.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['admin'],
      title: 'DB Manager',
    },
  },
]
