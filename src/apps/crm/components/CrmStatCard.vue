<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
      {{ label }}
    </p>
    <p class="mt-3 text-3xl font-semibold text-slate-900">
      {{ value }}
    </p>
    <p v-if="hint" class="mt-2 text-sm text-slate-500">
      {{ hint }}
    </p>
  </article>
</template>

<script setup>
/**
 * Generic KPI card for CRM dashboard views.
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
});
</script>
