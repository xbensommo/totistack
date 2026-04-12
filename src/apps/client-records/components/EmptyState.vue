<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
      {{ eyebrow }}
    </p>
    <h3 class="mt-3 text-lg font-semibold text-slate-900">
      {{ title }}
    </h3>
    <p v-if="description" class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-5 flex justify-center gap-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * @file EmptyState.vue
 * @description Generic empty state starter component.
 */

defineProps({
  eyebrow: {
    type: String,
    default: 'No data',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
