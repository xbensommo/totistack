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
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'CRM Dashboard' },
    },
    {
      path: '/crm/leads',
      name: 'crm-leads',
      component: localLazy('CrmLeadsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'CRM Leads' },
    },
    {
      path: '/crm/leads/:id',
      name: 'crm-lead-detail',
      component: localLazy('CrmLeadDetailPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Lead Details' },
    },
    {
      path: '/crm/contacts',
      name: 'crm-contacts',
      component: localLazy('CrmContactsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'CRM Contacts' },
    },
    {
      path: '/crm/accounts',
      name: 'crm-accounts',
      component: localLazy('CrmAccountsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'CRM Accounts' },
    },
    {
      path: '/crm/opportunities',
      name: 'crm-opportunities',
      component: localLazy('CrmOpportunitiesPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Opportunities' },
    },
    {
      path: '/crm/pipeline',
      name: 'crm-pipeline',
      component: localLazy('CrmPipelinePage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Pipeline' },
    },
    {
      path: '/crm/tasks',
      name: 'crm-tasks',
      component: localLazy('CrmTasksPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Tasks and Follow-ups' },
    },
    {
      path: '/crm/activities',
      name: 'crm-activities',
      component: localLazy('CrmActivitiesPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Activities' },
    },
    {
      path: '/crm/communications',
      name: 'crm-communications',
      component: localLazy('CrmCommunicationsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'WhatsApp and Email Logs' },
    },
    {
      path: '/crm/documents',
      name: 'crm-documents',
      component: localLazy('CrmDocumentsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Quotes, Invoices, and Receipts' },
    },
    {
      path: '/crm/records',
      name: 'crm-records',
      component: localLazy('CrmRecordsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Customer Records and History' },
    },
    {
      path: '/crm/search',
      name: 'crm-search',
      component: localLazy('CrmSearchPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Search and Saved Views' },
    },
    {
      path: '/crm/rules',
      name: 'crm-rules',
      component: localLazy('CrmRulesPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'Automation and Assignment Rules' },
    },
    {
      path: '/crm/reports',
      name: 'crm-reports',
      component: localLazy('CrmReportsPage'),
      meta: { requiresAuth: true, roles: ['admin', 'manager', 'sales'], permissions: ['crm:read'], title: 'CRM Reports' },
    },
  ];
}
