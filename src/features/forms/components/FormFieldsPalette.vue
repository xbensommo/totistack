<template>
  <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Field library</h3>
    <div class="mt-4 grid gap-3">
      <button
        v-for="field in fields"
        :key="field.type"
        type="button"
        class="rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
        @click="$emit('add', field)"
      >
        <span class="block text-sm font-semibold text-slate-900">{{ field.label }}</span>
        <span class="mt-1 block text-xs text-slate-500">{{ field.type }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
/**
 * @file forms/components/FormFieldsPalette.vue
 * @description Starter field palette for the form builder experience.
 */
defineProps({
  fields: { type: Array, default: () => [] },
})
defineEmits(['add'])
</script>
