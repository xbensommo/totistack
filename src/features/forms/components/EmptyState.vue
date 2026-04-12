<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
    <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-5 flex justify-center">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
/**
 * @file components/EmptyState.vue
 * @description Generic empty state used by starter feature pages.
 */
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
