/**
 * @file apps/dashboard/routes.js
 * @description Route contribution for the dashboard app.
 *
 * The generated router consumes these route records at build time.
 * This module stays declarative and does not mutate the router at runtime.
 */

/**
 * Build dashboard route records.
 *
 * @returns {import('vue-router').RouteRecordRaw[]}
 */
export default function createDashboardRoutes() {
  const localLazy = (view) => () => import(`./pages/${view}.vue`);

  return [
    {
      path: '',
      name: 'dashboard-home',
      component: localLazy('DashboardPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager', 'user'],
        permissions: ['dashboard:read'],
        title: 'Dashboard',
      },
    },
    {
      path: '/dashboard/analytics',
      name: 'dashboard-analytics',
      component: localLazy('AnalyticsPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager'],
        permissions: ['analytics:read'],
        title: 'Analytics',
      },
    },
    {
      path: '/dashboard/reports',
      name: 'dashboard-reports',
      component: localLazy('ReportsPage'),
      meta: {
        requiresAuth: true,
        roles: ['admin', 'manager'],
        permissions: ['reports:read'],
        title: 'Reports',
      },
    },
  ];
}
