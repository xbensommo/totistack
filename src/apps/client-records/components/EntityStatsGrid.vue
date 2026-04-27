<template>
  <div class="kpi-grid">
    <article
      v-for="item in items"
      :key="item.label"
      class="metric-card"
    >
      <div class="space-y-2">
        <p class="stat-title uppercase tracking-[0.18em]">
          {{ item.label }}
        </p>
        <p class="stat-value text-2xl md:text-3xl">
          {{ item.value }}
        </p>
        <p v-if="item.helpText" class="text-sm text-muted">
          {{ item.helpText }}
        </p>
      </div>
    </article>
  </div>
</template>

<script setup>
/**
 * @file EntityStatsGrid.vue
 * @description Generic stat card grid for admin and CRM-style apps.
 */

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>
