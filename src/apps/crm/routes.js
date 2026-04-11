/**
 * @file crm/routes.js
 * @description Declarative CRM routes consumed by the Totistack generated router.
 */

/**
 * @returns {import('vue-router').RouteRecordRaw[]}
 */
export default [
  {
    path: '/crm',
    name: 'CrmDashboard',
    component: () => import('./pages/CrmDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'crm',
      title: 'CRM Dashboard',
      roles: ['admin', 'manager', 'sales'],
    },
  },
  {
    path: '/crm/leads',
    name: 'CrmLeadsList',
    component: () => import('./pages/LeadsListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'crm',
      title: 'CRM Leads',
      roles: ['admin', 'manager', 'sales'],
    },
  },
  {
    path: '/crm/leads/:id',
    name: 'CrmLeadDetail',
    component: () => import('./pages/LeadDetailPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'crm',
      title: 'Lead Details',
      roles: ['admin', 'manager', 'sales'],
    },
  },
  {
    path: '/crm/opportunities',
    name: 'CrmOpportunitiesList',
    component: () => import('./pages/OpportunitiesListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'crm',
      title: 'CRM Opportunities',
      roles: ['admin', 'manager', 'sales'],
    },
  },
  {
    path: '/crm/activities',
    name: 'CrmActivitiesList',
    component: () => import('./pages/ActivitiesListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'crm',
      title: 'CRM Activities',
      roles: ['admin', 'manager', 'sales', 'support'],
    },
  },
]
