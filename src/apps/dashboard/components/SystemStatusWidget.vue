<template>
  <DashboardWidgetCard title="System Status" description="Starter health summary for auth, RBAC, network, and generated data access.">
    <div class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="list-row items-start bg-surface-2"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="text-sm font-semibold text-[var(--color-text)]">
              {{ item.label }}
            </h4>
            <p class="mt-1 text-sm leading-6 text-soft">
              {{ item.detail }}
            </p>
          </div>
          <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="badgeClass(item.status)">
            {{ item.status }}
          </span>
        </div>
      </article>
    </div>
  </DashboardWidgetCard>
</template>

<script setup>
/**
 * @file apps/dashboard/components/SystemStatusWidget.vue
 * @description System status widget for the dashboard starter app.
 */

import DashboardWidgetCard from './DashboardWidgetCard.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

function badgeClass(status) {
  switch (status) {
    case 'healthy':
      return 'badge-success';
    case 'warning':
      return 'badge-warning';
    case 'disabled':
      return 'badge';
    case 'starting':
      return 'badge-primary';
    default:
      return 'badge-danger';
  }
}
</script>
