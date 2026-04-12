<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
    <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-5 flex items-center justify-center gap-3">
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
