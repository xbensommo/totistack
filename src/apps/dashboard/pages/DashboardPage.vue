<template>
  <DashboardPageShell
    eyebrow="Operational Overview"
    title="Dashboard"
    description="A generic, production-ready dashboard starter wired for the latest Totistack generated assembly flow."
  >
    <template #actions>
      <RouterLink to="/dashboard/reports" class="btn-secondary">
        Open Reports
      </RouterLink>
      <RouterLink to="/dashboard/analytics" class="btn-primary">
        View Analytics
      </RouterLink>
    </template>

    <MetricsWidget :cards="snapshot.metrics.cards" />

    <div class="grid gap-6 xl:grid-cols-3">
      <div class="space-y-6 xl:col-span-2">
        <RecentActivityWidget :items="snapshot.recentActivity" />
        <ChartsWidget :charts="snapshot.charts" />
      </div>
      <div class="space-y-6">
        <NotificationsWidget :items="snapshot.notifications" />
        <QuickActionsWidget :items="snapshot.quickActions" />
        <SystemStatusWidget :items="snapshot.systemStatus" />
      </div>
    </div>
  </DashboardPageShell>
</template>

<script setup>
/**
 * @file apps/dashboard/pages/DashboardPage.vue
 * @description Main dashboard landing page.
 */

import { onMounted, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import DashboardPageShell from '../components/DashboardPageShell.vue';
import MetricsWidget from '../components/MetricsWidget.vue';
import RecentActivityWidget from '../components/RecentActivityWidget.vue';
import ChartsWidget from '../components/ChartsWidget.vue';
import NotificationsWidget from '../components/NotificationsWidget.vue';
import QuickActionsWidget from '../components/QuickActionsWidget.vue';
import SystemStatusWidget from '../components/SystemStatusWidget.vue';
import { useDashboardService } from '../services/dashboardService.js';

const dashboardService = useDashboardService();

const snapshot = reactive({
  metrics: { cards: [] },
  recentActivity: [],
  charts: {},
  notifications: [],
  quickActions: [],
  systemStatus: [],
});

async function loadDashboard() {
  const data = await dashboardService.getDashboardSnapshot();
  Object.assign(snapshot, data);
}

onMounted(() => {
  loadDashboard().catch(console.error);
});
</script>
