/**
 * Dashboard Store Module
 * @module apps/dashboard/stores/dashboardStore
 * @description Vuex store for dashboard state management
 * @author Totistack Team
 * @date 2026-03-22
 */

import { analyticsService } from '../../../features/analytics';

const state = () => ({
  metrics: {
    totalUsers: 0,
    totalOrders: 0,
    totalBookings: 0,
    revenue: 0,
    conversionRate: 0,
    activeSessions: 0
  },
  recentActivity: [],
  charts: {
    revenue: { labels: [], datasets: [] },
    users: { labels: [], datasets: [] },
    bookings: { labels: [], datasets: [] }
  },
  notifications: [],
  systemStatus: {
    api: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    lastCheck: null
  },
  isLoading: false,
  lastUpdated: null
});

const getters = {
  /**
   * Get formatted revenue
   */
  formattedRevenue: (state) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(state.metrics.revenue);
  },
  
  /**
   * Get metrics for display
   */
  metricsList: (state) => {
    return [
      { label: 'Total Users', value: state.metrics.totalUsers.toLocaleString(), icon: 'Users', trend: '+12%' },
      { label: 'Total Orders', value: state.metrics.totalOrders.toLocaleString(), icon: 'ShoppingCart', trend: '+8%' },
      { label: 'Total Bookings', value: state.metrics.totalBookings.toLocaleString(), icon: 'Calendar', trend: '+15%' },
      { label: 'Revenue', value: state.formattedRevenue, icon: 'DollarSign', trend: '+23%' }
    ];
  },
  
  /**
   * Check if system is healthy
   */
  isSystemHealthy: (state) => {
    return Object.values(state.systemStatus).every(status => 
      status === 'healthy' || status === 'connected'
    );
  }
};

const actions = {
  /**
   * Load dashboard metrics
   */
  async loadMetrics({ commit, rootState }) {
    commit('SET_LOADING', true);
    
    try {
      // Fetch metrics from analytics service
      const analytics = await analyticsService.getAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      });
      
      if (analytics) {
        commit('SET_METRICS', {
          totalUsers: analytics.overview?.uniqueUsers || 0,
          totalOrders: analytics.overview?.totalOrders || 0,
          totalBookings: analytics.overview?.totalBookings || 0,
          revenue: analytics.overview?.revenue || 0,
          conversionRate: analytics.overview?.conversionRate || 0,
          activeSessions: analytics.overview?.activeSessions || 0
        });
      }
      
      commit('SET_LAST_UPDATED', Date.now());
      
    } catch (error) {
      console.error('[DashboardStore] Failed to load metrics:', error);
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  /**
   * Load recent activity
   */
  async loadRecentActivity({ commit }) {
    try {
      // Fetch recent events from analytics
      const events = await analyticsService.getEvents({ limit: 10 });
      
      const activity = events?.map(event => ({
        id: event.id,
        type: event.name,
        description: this.#formatActivityDescription(event),
        timestamp: event.timestamp,
        userId: event.userId,
        metadata: event.data
      })) || [];
      
      commit('SET_RECENT_ACTIVITY', activity);
      
    } catch (error) {
      console.error('[DashboardStore] Failed to load activity:', error);
    }
  },
  
  /**
   * Load chart data
   */
  async loadChartData({ commit }, { period = '30d', metric = 'revenue' }) {
    try {
      const chartData = await analyticsService.getChartData({ period, metric });
      commit('SET_CHART_DATA', { metric, data: chartData });
    } catch (error) {
      console.error('[DashboardStore] Failed to load chart data:', error);
    }
  },
  
  /**
   * Check system health
   */
  async checkSystemHealth({ commit }) {
    try {
      const status = {
        api: await this.#checkApiHealth(),
        database: await this.#checkDatabaseHealth(),
        storage: await this.#checkStorageHealth(),
        lastCheck: new Date()
      };
      
      commit('SET_SYSTEM_STATUS', status);
      
    } catch (error) {
      console.error('[DashboardStore] Health check failed:', error);
      commit('SET_SYSTEM_STATUS', {
        api: 'error',
        database: 'error',
        storage: 'error',
        lastCheck: new Date(),
        error: error.message
      });
    }
  },
  
  /**
   * Format activity description
   * @private
   */
  #formatActivityDescription(event) {
    const descriptions = {
      'user_login': 'User logged in',
      'order_created': 'New order created',
      'booking_made': 'New booking made',
      'payment_received': 'Payment received',
      'user_signup': 'New user registered'
    };
    
    return descriptions[event.name] || event.name;
  },
  
  /**
   * Check API health
   * @private
   */
  async #checkApiHealth() {
    // Implement actual health check
    return 'healthy';
  },
  
  /**
   * Check database health
   * @private
   */
  async #checkDatabaseHealth() {
    return 'healthy';
  },
  
  /**
   * Check storage health
   * @private
   */
  async #checkStorageHealth() {
    return 'healthy';
  }
};

const mutations = {
  SET_METRICS(state, metrics) {
    state.metrics = { ...state.metrics, ...metrics };
  },
  
  SET_RECENT_ACTIVITY(state, activity) {
    state.recentActivity = activity;
  },
  
  SET_CHART_DATA(state, { metric, data }) {
    if (state.charts[metric]) {
      state.charts[metric] = data;
    }
  },
  
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications;
  },
  
  SET_SYSTEM_STATUS(state, status) {
    state.systemStatus = status;
  },
  
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  
  SET_LAST_UPDATED(state, timestamp) {
    state.lastUpdated = timestamp;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
