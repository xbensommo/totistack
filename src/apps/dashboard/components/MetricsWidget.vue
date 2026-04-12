<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <DashboardStatCard
      v-for="item in cards"
      :key="item.id || item.label"
      :label="item.label"
      :value="item.value"
      :description="item.description"
      :trend="item.trend || ''"
    />
  </div>
</template>

<script setup>
/**
 * @file apps/dashboard/components/MetricsWidget.vue
 * @description Metric grid widget for the dashboard starter app.
 */

import DashboardStatCard from './DashboardStatCard.vue';

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
});
</script>
