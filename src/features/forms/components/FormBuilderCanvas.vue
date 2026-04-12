<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">Form structure</h3>
        <p class="text-sm text-slate-500">Arrange fields, edit labels, and tune validation rules.</p>
      </div>
      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">{{ modelValue.length }} fields</span>
    </div>

    <div v-if="modelValue.length" class="mt-5 space-y-4">
      <article v-for="(field, index) in modelValue" :key="field.id || `${field.key}-${index}`" class="rounded-2xl border border-slate-200 p-4">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Label</span>
            <input v-model="field.label" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Key</span>
            <input v-model="field.key" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Type</span>
            <select v-model="field.type" class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0">
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="file">File</option>
            </select>
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>Placeholder</span>
            <input v-model="field.placeholder" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0" />
          </label>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-slate-600">
            <input v-model="field.isRequired" type="checkbox" class="rounded border-slate-300" />
            Required
          </label>
          <button type="button" class="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50" @click="$emit('remove', index)">
            Remove field
          </button>
        </div>
      </article>
    </div>

    <div v-else class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
      Start by adding a field from the library.
    </div>
  </section>
</template>

<script setup>
/**
 * @file forms/components/FormBuilderCanvas.vue
 * @description Generic editable canvas for starter form definitions.
 */
defineProps({
  modelValue: { type: Array, default: () => [] },
})
defineEmits(['remove'])
</script>
