<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{{ integration.provider }}</p>
        <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ integration.name }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ integration.category || 'General connector' }}</p>
      </div>
      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{{ integration.status }}</span>
    </div>
    <div class="mt-4 flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup>
/**
 * @file integrations/components/IntegrationCard.vue
 * @description Generic summary card for a configured integration.
 */
defineProps({
  integration: { type: Object, required: true },
})
</script>
