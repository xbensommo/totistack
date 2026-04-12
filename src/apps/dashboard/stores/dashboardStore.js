/**
 * @file apps/dashboard/stores/dashboardStore.js
 * @description Optional local dashboard store for widget state and page-level caching.
 *
 * Notes:
 * - This is not a root store and it does not self-register.
 * - Auth and RBAC remain in the root application store.
 * - This wrapper exists mainly for backward compatibility and local UI concerns.
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useDashboardService } from '../services/dashboardService.js';

export const useDashboardStore = defineStore('dashboardModule', () => {
  const dashboardService = useDashboardService();

  const metrics = ref({ cards: [], raw: {} });
  const recentActivity = ref([]);
  const charts = ref({});
  const notifications = ref([]);
  const quickActions = ref([]);
  const systemStatus = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);

  /**
   * Load the full dashboard snapshot into local state.
   *
   * @returns {Promise<Record<string, any>>}
   */
  async function hydrate() {
    loading.value = true;
    error.value = null;

    try {
      const snapshot = await dashboardService.getDashboardSnapshot();
      metrics.value = snapshot.metrics;
      recentActivity.value = snapshot.recentActivity;
      charts.value = snapshot.charts;
      notifications.value = snapshot.notifications;
      quickActions.value = snapshot.quickActions;
      systemStatus.value = snapshot.systemStatus;
      lastUpdated.value = snapshot.generatedAt;
      return snapshot;
    } catch (caughtError) {
      error.value = caughtError;
      throw caughtError;
    } finally {
      loading.value = false;
    }
  }

  return {
    metrics,
    recentActivity,
    charts,
    notifications,
    quickActions,
    systemStatus,
    loading,
    error,
    lastUpdated,
    hasData: computed(() => metrics.value.cards.length > 0 || recentActivity.value.length > 0),
    hydrate,
  };
});

export default useDashboardStore;
