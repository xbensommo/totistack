<template>
  <label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-100">
    <span class="text-lg font-semibold text-slate-900">{{ title }}</span>
    <span class="mt-2 max-w-2xl text-sm text-slate-600">{{ description }}</span>
    <input class="hidden" type="file" :multiple="multiple" @change="handleChange" />
  </label>
</template>

<script setup>
/**
 * @file media/components/UploadDropzone.vue
 * @description Starter file input dropzone used by the media upload page.
 */
const props = defineProps({
  title: { type: String, default: 'Upload assets' },
  description: { type: String, default: 'Select one or more files to create media records.' },
  multiple: { type: Boolean, default: true },
})
const emit = defineEmits(['select'])

function handleChange(event) {
  emit('select', Array.from(event.target.files || []), props.multiple)
}
</script>
