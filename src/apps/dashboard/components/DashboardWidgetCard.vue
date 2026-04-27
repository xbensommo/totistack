<template>
  <article class="chart-card card-hover">
    <header class="mb-5 flex items-start justify-between gap-4">
      <div class="space-y-1.5">
        <h3 class="section-title text-lg md:text-xl">
          {{ title }}
        </h3>
        <p v-if="description" class="text-sm leading-6 text-muted">
          {{ description }}
        </p>
      </div>
      <slot name="header-actions" />
    </header>

    <div>
      <slot />
    </div>
  </article>
</template>

<script setup>
/**
 * @file apps/dashboard/components/DashboardWidgetCard.vue
 * @description Generic widget card container for dashboard sections.
 */

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>
