/**
 * @file workflows/routes.js
 * @description Route records contributed by the workflows feature.
 */
export default [
  {
    path: '/admin/workflows',
    name: 'WorkflowsList',
    component: () => import('./pages/WorkflowsListPage.vue'),
    meta: { requiresAuth: true, feature: 'workflows', permissions: ['workflows.view'], title: 'Workflows' },
  },
  {
    path: '/admin/workflows/new',
    name: 'WorkflowCreate',
    component: () => import('./pages/WorkflowBuilderPage.vue'),
    meta: { requiresAuth: true, feature: 'workflows', permissions: ['workflows.manage'], title: 'Create Workflow' },
  },
  {
    path: '/admin/workflows/:workflowId',
    name: 'WorkflowEdit',
    component: () => import('./pages/WorkflowBuilderPage.vue'),
    meta: { requiresAuth: true, feature: 'workflows', permissions: ['workflows.manage'], title: 'Edit Workflow' },
  },
  {
    path: '/admin/workflows/runs',
    name: 'WorkflowRuns',
    component: () => import('./pages/WorkflowRunsPage.vue'),
    meta: { requiresAuth: true, feature: 'workflows', permissions: ['workflows.view'], title: 'Workflow Runs' },
  },
]
