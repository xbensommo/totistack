<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ value }}</p>
      </div>
      <div v-if="icon" class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
        {{ icon }}
      </div>
    </div>

    <p v-if="hint" class="mt-3 text-xs leading-5 text-slate-500">
      {{ hint }}
    </p>
  </article>
</template>

<script setup>
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
    default: '',
  },
})
</script>
