<template>
  <div class="empty-state">
    <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-sm font-semibold text-primary">
      0
    </div>
    <h3 class="text-xl font-semibold text-[var(--color-text)]">{{ title }}</h3>
    <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-6 flex flex-wrap items-center justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Nothing here yet',
  },
  description: {
    type: String,
    default: 'Create your first record to get started.',
  },
})
</script>
