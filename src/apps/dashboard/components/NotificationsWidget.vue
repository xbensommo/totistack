<template>
  <DashboardWidgetCard title="Notifications" description="Starter notification feed for system and operational updates.">
    <div v-if="items.length" class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-slate-100 bg-slate-50 p-4"
      >
        <div class="flex items-start gap-3">
          <span class="mt-1 h-2.5 w-2.5 rounded-full" :class="dotClass(item.level)" />
          <div>
            <h4 class="text-sm font-semibold text-slate-900">
              {{ item.title }}
            </h4>
            <p class="mt-1 text-sm text-slate-600">
              {{ item.description }}
            </p>
          </div>
        </div>
      </article>
    </div>
    <p v-else class="text-sm text-slate-500">
      No notifications are available yet.
    </p>
  </DashboardWidgetCard>
</template>

<script setup>
/**
 * @file apps/dashboard/components/NotificationsWidget.vue
 * @description Generic notification list widget for the dashboard starter app.
 */

import DashboardWidgetCard from './DashboardWidgetCard.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

function dotClass(level) {
  switch (level) {
    case 'success':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'error':
      return 'bg-rose-500';
    default:
      return 'bg-sky-500';
  }
}
</script>
