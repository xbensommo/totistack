/**
 * Dashboard App Entry Point
 * @module apps/dashboard
 * @description Main entry point for dashboard application
 * @author Totistack Team
 * @date 2026-03-22
 */

import dashboardStore from './stores/dashboardStore';
import dashboardRoutes from './routes';
import MetricsWidget from './components/MetricsWidget.vue';
import RecentActivityWidget from './components/RecentActivityWidget.vue';
import ChartsWidget from './components/ChartsWidget.vue';
import NotificationsWidget from './components/NotificationsWidget.vue';
import QuickActionsWidget from './components/QuickActionsWidget.vue';
import SystemStatusWidget from './components/SystemStatusWidget.vue';
import DashboardPage from './pages/DashboardPage.vue';
import AnalyticsPage from './pages/AnalyticsPage.vue';
import ReportsPage from './pages/ReportsPage.vue';

/**
 * Initialize the dashboard app
 * @param {Object} context - Application context
 * @param {Object} config - App configuration
 * @returns {Promise<Object>} Initialized app API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Dashboard App] Initializing...');
    
    // Validate dependencies
    if (!context.features?.analytics) {
      throw new Error('Dashboard app requires analytics feature');
    }
    
    // Register store module
    if (context.store && !context.store.hasModule('dashboard')) {
      context.store.registerModule('dashboard', dashboardStore);
    }
    
    // Register routes
    if (context.router) {
      dashboardRoutes.forEach(route => {
        context.router.addRoute(route);
      });
    }
    
    // Register components globally
    if (context.app) {
      context.app.component('MetricsWidget', MetricsWidget);
      context.app.component('RecentActivityWidget', RecentActivityWidget);
      context.app.component('ChartsWidget', ChartsWidget);
      context.app.component('NotificationsWidget', NotificationsWidget);
      context.app.component('QuickActionsWidget', QuickActionsWidget);
      context.app.component('SystemStatusWidget', SystemStatusWidget);
    }
    
    console.info('[Dashboard App] Initialized successfully');
    
    return {
      DashboardPage,
      AnalyticsPage,
      ReportsPage,
      dashboardStore
    };
    
  } catch (error) {
    console.error('[Dashboard App] Initialization failed:', error);
    throw new Error(`Failed to initialize dashboard app: ${error.message}`);
  }
}

export default { initialize };
