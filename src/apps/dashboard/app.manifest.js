/**
 * @file apps/dashboard/app.manifest.js
 * @description Declarative dashboard manifest aligned with the latest Totistack assembly flow.
 *
 * Notes:
 * - This module does not self-register routes, stores, or providers.
 * - Auth and RBAC are owned by the root application store.
 * - Dashboard-specific route records live in ./routes.js.
 * - This app intentionally keeps data access generic so it can sit on top of many projects.
 */

export default {
  id: 'dashboard',
  name: 'Dashboard',
  version: '3.0.0',
  description: 'Administrative dashboard with metrics, activity, widgets, analytics, and reporting starter screens.',
  provider: 'firestore',
  usesFirestore: true,
  dependencies: {
    features: ['auth', 'rbac', 'analytics'],
    apps: [],
  },
  navigation: {
    icon: 'LayoutDashboard',
    priority: 1,
    roles: ['admin', 'manager', 'user'],
  },
  collections: [],
  widgets: [
    { id: 'metrics', component: 'MetricsWidget', grid: { x: 0, y: 0, w: 12, h: 4 } },
    { id: 'recent-activity', component: 'RecentActivityWidget', grid: { x: 0, y: 4, w: 6, h: 8 } },
    { id: 'charts', component: 'ChartsWidget', grid: { x: 6, y: 4, w: 6, h: 8 } },
    { id: 'notifications', component: 'NotificationsWidget', grid: { x: 0, y: 12, w: 4, h: 6 } },
    { id: 'quick-actions', component: 'QuickActionsWidget', grid: { x: 4, y: 12, w: 4, h: 6 } },
    { id: 'system-status', component: 'SystemStatusWidget', grid: { x: 8, y: 12, w: 4, h: 6 } },
  ],
};
