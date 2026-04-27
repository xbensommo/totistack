<template>
  <DashboardWidgetCard title="Notifications" description="Starter notification feed for system and operational updates.">
    <div v-if="items.length" class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="list-row items-start bg-surface-2"
      >
        <div class="flex items-start gap-3">
          <span class="mt-1.5 h-2.5 w-2.5 rounded-full" :class="dotClass(item.level)" />
          <div>
            <h4 class="text-sm font-semibold text-[var(--color-text)]">
              {{ item.title }}
            </h4>
            <p class="mt-1 text-sm leading-6 text-soft">
              {{ item.description }}
            </p>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty-state px-6 py-10">
      <p class="text-sm text-muted">
        No notifications are available yet.
      </p>
    </div>
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
