/**
 * @file routes.js
 * @description Declarative routes for the Client Records app.
 */

/**
 * Build Client Records route records.
 *
 * @returns {import('vue-router').RouteRecordRaw[]}
 */
export default function createClientRecordRoutes() {
  return [
    {
      path: '/clients',
      name: 'ClientsList',
      component: () => import('./pages/ClientsListPage.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'agent'],
        permissions: ['clients.read'],
        feature: 'client-records',
        title: 'Client Records',
      },
    },
    {
      path: '/clients/new',
      name: 'ClientCreate',
      component: () => import('./pages/ClientCreatePage.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager'],
        permissions: ['clients.create'],
        feature: 'client-records',
        title: 'Create Client',
      },
    },
    {
      path: '/clients/:id',
      name: 'ClientDetail',
      component: () => import('./pages/ClientDetailPage.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'agent'],
        permissions: ['clients.read'],
        feature: 'client-records',
        title: 'Client Detail',
      },
    },
    {
      path: '/clients/:id/edit',
      name: 'ClientEdit',
      component: () => import('./pages/ClientEditPage.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager'],
        permissions: ['clients.update'],
        feature: 'client-records',
        title: 'Edit Client',
      },
    },
  ]
}
