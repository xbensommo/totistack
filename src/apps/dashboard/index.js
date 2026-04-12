/**
 * @file apps/dashboard/index.js
 * @description Backward-compatible dashboard barrel exports.
 *
 * This module is declarative. It does not self-register routes, stores, or providers.
 * The Totistack generated assembly layer discovers these exports at build time.
 */

export { default as manifest } from './app.manifest.js';
export { default as routes } from './routes.js';
export {
  createDashboardService,
  useDashboardService,
  DASHBOARD_COLLECTION_HINTS,
  DASHBOARD_WIDGETS,
} from './services/dashboardService.js';

export { default as DashboardPageShell } from './components/DashboardPageShell.vue';
export { default as DashboardStatCard } from './components/DashboardStatCard.vue';
export { default as DashboardWidgetCard } from './components/DashboardWidgetCard.vue';
export { default as MetricsWidget } from './components/MetricsWidget.vue';
export { default as RecentActivityWidget } from './components/RecentActivityWidget.vue';
export { default as ChartsWidget } from './components/ChartsWidget.vue';
export { default as NotificationsWidget } from './components/NotificationsWidget.vue';
export { default as QuickActionsWidget } from './components/QuickActionsWidget.vue';
export { default as SystemStatusWidget } from './components/SystemStatusWidget.vue';
