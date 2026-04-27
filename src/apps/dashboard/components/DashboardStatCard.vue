<template>
  <article class="metric-card card-hover">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-caption">
          {{ label }}
        </p>
        <h3 class="stat-value !mt-0 text-2xl md:text-3xl">
          {{ value }}
        </h3>
        <p v-if="description" class="text-sm leading-6 text-soft">
          {{ description }}
        </p>
      </div>

      <span v-if="trend" class="badge badge-primary shrink-0">
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
