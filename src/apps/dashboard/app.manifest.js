/**
 * Dashboard App Manifest
 * @module apps/dashboard
 * @description Dashboard application providing analytics, metrics, and administrative overview
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'dashboard',
  name: 'Dashboard',
  version: '2.0.0',
  description: 'Administrative dashboard with analytics, metrics, and system overview',
  
  // Dependencies
  dependencies: {
    features: ['auth', 'rbac', 'analytics'],
    apps: []
  },
  
  // Navigation configuration
  navigation: {
    icon: 'LayoutDashboard',
    priority: 1,
    roles: ['admin', 'manager', 'user']
  },
  
  // Dashboard widgets configuration
  widgets: [
    { id: 'metrics', component: 'MetricsWidget', grid: { x: 0, y: 0, w: 12, h: 4 } },
    { id: 'recentActivity', component: 'RecentActivityWidget', grid: { x: 0, y: 4, w: 6, h: 8 } },
    { id: 'charts', component: 'ChartsWidget', grid: { x: 6, y: 4, w: 6, h: 8 } },
    { id: 'notifications', component: 'NotificationsWidget', grid: { x: 0, y: 12, w: 4, h: 6 } },
    { id: 'quickActions', component: 'QuickActionsWidget', grid: { x: 4, y: 12, w: 4, h: 6 } },
    { id: 'systemStatus', component: 'SystemStatusWidget', grid: { x: 8, y: 12, w: 4, h: 6 } }
  ],
  
  // Routes
  routes: [
    { path: '/dashboard', name: 'dashboard', component: 'DashboardPage', meta: { requiresAuth: true } },
    { path: '/dashboard/analytics', name: 'analytics', component: 'AnalyticsPage', meta: { requiresAuth: true, permissions: ['analytics:read'] } },
    { path: '/dashboard/reports', name: 'reports', component: 'ReportsPage', meta: { requiresAuth: true, permissions: ['reports:read'] } }
  ]
};
