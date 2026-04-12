<template>
  <DashboardWidgetCard title="Quick Actions" description="Reusable starter actions that can be replaced or extended per project.">
    <div class="space-y-3">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="block rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white"
      >
        <h4 class="text-sm font-semibold text-slate-900">
          {{ item.label }}
        </h4>
        <p class="mt-1 text-sm text-slate-600">
          {{ item.description }}
        </p>
      </RouterLink>
    </div>
  </DashboardWidgetCard>
</template>

<script setup>
/**
 * @file apps/dashboard/components/QuickActionsWidget.vue
 * @description Quick action widget for the dashboard starter app.
 */

import { RouterLink } from 'vue-router';
import DashboardWidgetCard from './DashboardWidgetCard.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>
