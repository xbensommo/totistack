<template>
  <div class="flex flex-col items-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
      {{ icon }}
    </div>
    <h3 class="mt-4 text-lg font-semibold text-slate-950">{{ title }}</h3>
    <p class="mt-2 max-w-md text-sm leading-6 text-slate-500">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-5 flex flex-wrap justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '📦',
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
