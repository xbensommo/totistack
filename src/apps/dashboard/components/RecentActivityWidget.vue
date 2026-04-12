<template>
  <DashboardWidgetCard title="Recent Activity" description="Latest operational activity pulled from the root store or activity collections.">
    <div v-if="items.length" class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-slate-100 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="text-sm font-semibold text-slate-900">
              {{ item.title }}
            </h4>
            <p class="mt-1 text-sm text-slate-600">
              {{ item.description }}
            </p>
          </div>
          <span class="whitespace-nowrap text-xs text-slate-500">
            {{ formatTimestamp(item.timestamp) }}
          </span>
        </div>
      </article>
    </div>
    <p v-else class="text-sm text-slate-500">
      No recent activity is available yet.
    </p>
  </DashboardWidgetCard>
</template>

<script setup>
/**
 * @file apps/dashboard/components/RecentActivityWidget.vue
 * @description Recent activity widget for the dashboard starter app.
 */

import DashboardWidgetCard from './DashboardWidgetCard.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

function formatTimestamp(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
</script>
