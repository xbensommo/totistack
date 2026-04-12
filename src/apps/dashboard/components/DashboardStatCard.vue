<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {{ label }}
        </p>
        <h3 class="text-2xl font-semibold tracking-tight text-slate-900">
          {{ value }}
        </h3>
        <p v-if="description" class="text-sm leading-6 text-slate-600">
          {{ description }}
        </p>
      </div>

      <span v-if="trend" class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
        {{ trend }}
      </span>
    </div>
  </article>
</template>

<script setup>
/**
 * @file apps/dashboard/components/DashboardStatCard.vue
 * @description Generic metric card component for starter dashboards.
 */

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  trend: {
    type: String,
    default: '',
  },
});
</script>
