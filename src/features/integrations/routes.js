/**
 * @file integrations/routes.js
 * @description Route records contributed by the integrations feature.
 */
export default [
  {
    path: '/admin/integrations',
    name: 'IntegrationsList',
    component: () => import('./pages/IntegrationsListPage.vue'),
    meta: { requiresAuth: true, feature: 'integrations', permissions: ['integrations.view'], title: 'Integrations' },
  },
  {
    path: '/admin/integrations/:integrationId',
    name: 'IntegrationDetail',
    component: () => import('./pages/IntegrationDetailPage.vue'),
    meta: { requiresAuth: true, feature: 'integrations', permissions: ['integrations.manage'], title: 'Integration Detail' },
  },
  {
    path: '/admin/integrations/logs',
    name: 'IntegrationLogs',
    component: () => import('./pages/WebhookLogPage.vue'),
    meta: { requiresAuth: true, feature: 'integrations', permissions: ['integrations.view'], title: 'Integration Logs' },
  },
]
