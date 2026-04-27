<template>
  <div class="empty-state">
    <p class="text-caption">
      {{ eyebrow }}
    </p>
    <h3 class="mt-3 text-xl font-semibold text-[var(--color-text)]">
      {{ title }}
    </h3>
    <p v-if="description" class="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
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
