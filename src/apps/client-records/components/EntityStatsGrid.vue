<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="item in items"
      :key="item.label"
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ item.label }}
        </p>
        <p class="text-2xl font-semibold text-slate-900">
          {{ item.value }}
        </p>
        <p v-if="item.helpText" class="text-sm text-slate-500">
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
