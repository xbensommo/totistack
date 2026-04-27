<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
    <h3 class="text-base font-semibold text-slate-950">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-xl text-sm text-slate-600">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
