/**
 * @file apps/crm/routes.js
 * @description Route contribution for the CRM app.
 *
 * The generated router calls this file at build time. Route components are lazy-loaded
 * from within this CRM module so the framework core does not need CRM-specific imports.
 */

/**
 * Build CRM route records.
 *
 * @returns {import('vue-router').RouteRecordRaw[]}
 */
export default function createCrmRoutes() {
  const localLazy = (view) => () => import(`./pages/${view}.vue`);

  return [
    {
      path: '/crm',
      name: 'crm-dashboard',
      component: localLazy('CrmDashboardPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'sales'],
        permissions: ['crm:read'],
        title: 'CRM Dashboard',
      },
    },
    {
      path: '/crm/leads',
      name: 'crm-leads',
      component: localLazy('CrmLeadsPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'sales'],
        permissions: ['crm:read'],
        title: 'CRM Leads',
      },
    },
    {
      path: '/crm/leads/:id',
      name: 'crm-lead-detail',
      component: localLazy('CrmLeadDetailPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'sales'],
        permissions: ['crm:read'],
        title: 'Lead Details',
      },
    },
    {
      path: '/crm/opportunities',
      name: 'crm-opportunities',
      component: localLazy('CrmOpportunitiesPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'sales'],
        permissions: ['crm:read'],
        title: 'Opportunities',
      },
    },
    {
      path: '/crm/pipeline',
      name: 'crm-pipeline',
      component: localLazy('CrmPipelinePage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'sales'],
        permissions: ['crm:read'],
        title: 'Pipeline',
      },
    },
    {
      path: '/crm/activities',
      name: 'crm-activities',
      component: localLazy('CrmActivitiesPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'sales'],
        permissions: ['crm:read'],
        title: 'Activities',
      },
    },
  ];
}
