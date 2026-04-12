<template>
  <DashboardPageShell
    eyebrow="Reporting"
    title="Reports"
    description="Starter report summaries that can be extended into exports, scheduled reports, or department-specific dashboards."
  >
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <DashboardStatCard
        v-for="item in reportCards"
        :key="item.id"
        :label="item.label"
        :value="item.value"
        :description="item.description"
      />
    </div>

    <DashboardWidgetCard title="Report Notes" description="These starter notes make the app useful immediately while staying easy to replace later.">
      <ul class="space-y-3 text-sm leading-6 text-slate-600">
        <li>Use this page as the handoff point for CSV, PDF, or email report generation later.</li>
        <li>Metrics are already derived from the root store and generated collection actions.</li>
        <li>Once project-specific reporting rules are ready, replace these starter cards with targeted report blocks.</li>
      </ul>
    </DashboardWidgetCard>
  </DashboardPageShell>
</template>

<script setup>
/**
 * @file apps/dashboard/pages/ReportsPage.vue
 * @description Report starter page for the dashboard app.
 */

import { computed, onMounted, ref } from 'vue';
import DashboardPageShell from '../components/DashboardPageShell.vue';
import DashboardStatCard from '../components/DashboardStatCard.vue';
import DashboardWidgetCard from '../components/DashboardWidgetCard.vue';
import { useDashboardService } from '../services/dashboardService.js';

const dashboardService = useDashboardService();
const metrics = ref({ raw: {} });

const reportCards = computed(() => {
  const raw = metrics.value.raw || {};

  return [
    {
      id: 'users',
      label: 'Users in Scope',
      value: raw.totalUsers?.toLocaleString?.() || raw.totalUsers || 0,
      description: 'Useful for adoption and account growth summaries.',
    },
    {
      id: 'orders',
      label: 'Orders in Scope',
      value: raw.totalOrders?.toLocaleString?.() || raw.totalOrders || 0,
      description: 'Starter order volume summary for reporting extensions.',
    },
    {
      id: 'revenue',
      label: 'Revenue Snapshot',
      value: new Intl.NumberFormat('en-NA', { style: 'currency', currency: 'NAD', maximumFractionDigits: 0 }).format(raw.revenue || 0),
      description: 'Derived from orders or closed opportunities when available.',
    },
  ];
});

onMounted(() => {
  dashboardService.getOverviewMetrics()
    .then((value) => {
      metrics.value = value;
    })
    .catch(console.error);
});
</script>
