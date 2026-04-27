<template>
  <div class="empty-state">
    <div
      class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-primary shadow-theme-xs"
    >
      <i class="fas fa-inbox text-xl"></i>
    </div>
    <h3 class="text-xl font-semibold text-[var(--color-text)]">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-2xl text-sm leading-7 text-muted">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-6 flex justify-center">
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
