<template>
  <DashboardWidgetCard title="System Status" description="Starter health summary for auth, RBAC, network, and generated data access.">
    <div class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-slate-100 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="text-sm font-semibold text-slate-900">
              {{ item.label }}
            </h4>
            <p class="mt-1 text-sm text-slate-600">
              {{ item.detail }}
            </p>
          </div>
          <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="badgeClass(item.status)">
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
      return 'bg-emerald-100 text-emerald-700';
    case 'warning':
      return 'bg-amber-100 text-amber-700';
    case 'disabled':
      return 'bg-slate-100 text-slate-700';
    case 'starting':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-rose-100 text-rose-700';
  }
}
</script>
