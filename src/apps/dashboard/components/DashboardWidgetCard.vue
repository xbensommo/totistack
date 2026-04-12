<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <header class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-1 text-sm text-slate-600">
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
