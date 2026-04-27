<template>
  <DashboardWidgetCard
    title="Trend Snapshot"
    description="A lightweight visual of recent collection growth without forcing a charting dependency."
  >
    <div class="space-y-6">
      <section
        v-for="series in normalizedSeries"
        :key="series.id"
        class="rounded-theme-xl border border-theme bg-surface-2 p-4 md:p-5"
      >
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <h4 class="text-sm font-semibold text-[var(--color-text)]">
              {{ series.label }}
            </h4>
            <p class="mt-1 text-xs text-muted">
              10-point condensed trend view
            </p>
          </div>
          <span class="badge badge-primary">
            {{ series.values[series.values.length - 1] || 0 }} latest
          </span>
        </div>

        <div class="grid h-28 grid-cols-10 items-end gap-2">
          <div
            v-for="(value, index) in compactValues(series.values)"
            :key="`${series.id}-${index}`"
            class="rounded-t-xl bg-brand-gradient shadow-theme-xs transition-theme hover:opacity-90"
            :style="{ height: `${getColumnHeight(value, series.max)}%` }"
          />
        </div>
      </section>
    </div>
  </DashboardWidgetCard>
</template>

<script setup>
/**
 * @file apps/dashboard/components/ChartsWidget.vue
 * @description Lightweight chart widget that avoids hard chart-library coupling.
 */

import { computed } from 'vue';
import DashboardWidgetCard from './DashboardWidgetCard.vue';

const props = defineProps({
  charts: {
    type: Object,
    default: () => ({}),
  },
});

const normalizedSeries = computed(() => {
  return Object.entries(props.charts || {}).map(([key, value]) => {
    const values = Array.isArray(value?.values) ? value.values : [];
    return {
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      values,
      max: Math.max(...values, 1),
    };
  });
});

function compactValues(values = []) {
  if (values.length <= 10) return values;
  const chunkSize = Math.ceil(values.length / 10);
  const compacted = [];
  for (let index = 0; index < values.length; index += chunkSize) {
    const chunk = values.slice(index, index + chunkSize);
    compacted.push(chunk.reduce((sum, value) => sum + value, 0));
  }
  return compacted.slice(-10);
}

function getColumnHeight(value, max) {
  if (!max) return 4;
  return Math.max(4, Math.round((value / max) * 100));
}
</script>
