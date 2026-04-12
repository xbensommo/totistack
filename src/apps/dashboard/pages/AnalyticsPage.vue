<template>
  <DashboardPageShell
    eyebrow="Insights"
    title="Analytics"
    description="Operational trends derived from the generated collection registry and any loaded project data."
  >
    <MetricsWidget :cards="metrics.cards" />
    <ChartsWidget :charts="charts" />
  </DashboardPageShell>
</template>

<script setup>
/**
 * @file apps/dashboard/pages/AnalyticsPage.vue
 * @description Analytics starter page for the dashboard app.
 */

import { onMounted, reactive } from 'vue';
import DashboardPageShell from '../components/DashboardPageShell.vue';
import MetricsWidget from '../components/MetricsWidget.vue';
import ChartsWidget from '../components/ChartsWidget.vue';
import { useDashboardService } from '../services/dashboardService.js';

const dashboardService = useDashboardService();

const metrics = reactive({ cards: [] });
const charts = reactive({});

async function loadAnalytics() {
  const [metricData, chartData] = await Promise.all([
    dashboardService.getOverviewMetrics(),
    dashboardService.getChartData(),
  ]);

  Object.assign(metrics, metricData);
  Object.assign(charts, chartData);
}

onMounted(() => {
  loadAnalytics().catch(console.error);
});
</script>
