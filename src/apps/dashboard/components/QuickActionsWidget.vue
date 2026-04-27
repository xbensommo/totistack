<template>
  <DashboardWidgetCard title="Quick Actions" description="Reusable starter actions that can be replaced or extended per project.">
    <div class="space-y-3">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="list-row group block bg-surface-2"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="text-sm font-semibold text-[var(--color-text)] transition-theme group-hover:text-primary">
              {{ item.label }}
            </h4>
            <p class="mt-1 text-sm leading-6 text-soft">
              {{ item.description }}
            </p>
          </div>
          <span class="badge badge-primary">Open</span>
        </div>
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
