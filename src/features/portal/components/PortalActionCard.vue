<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-950">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ description }}</p>
      </div>
      <button
        type="button"
        class="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        @click="$emit('run')"
      >
        {{ actionLabel }}
      </button>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: 'Open' },
})

defineEmits(['run'])
</script>
