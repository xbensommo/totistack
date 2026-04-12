<template>
  <article class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{{ label }}</p>
        <p class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{{ value }}</p>
      </div>
      <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg text-white shadow-sm">
        {{ icon }}
      </div>
    </div>
    <p v-if="hint" class="mt-3 text-sm leading-5 text-slate-500">{{ hint }}</p>
  </article>
</template>

<script setup>
/**
 * Small reusable metric card.
 */
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '•',
  },
})
</script>
