<template>
  <div class="kpi-grid">
    <article v-for="item in items" :key="item.label" class="metric-card">
      <p class="stat-title">{{ item.label }}</p>
      <p class="stat-value">{{ item.value }}</p>
      <p v-if="item.hint" class="mt-2 text-sm text-muted">{{ item.hint }}</p>
    </article>
  </div>
</template>

<script setup>
/**
 * @file components/MetricsGrid.vue
 * @description Generic metrics grid for feature overview pages.
 */
defineProps({
  items: { type: Array, default: () => [] },
})
</script>
