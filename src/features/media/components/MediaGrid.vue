<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <button
      v-for="file in files"
      :key="file.id"
      type="button"
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      @click="$emit('select', file)"
    >
      <div class="flex h-40 items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {{ file.mimeType || 'asset' }}
      </div>
      <div class="p-4">
        <p class="truncate text-sm font-semibold text-slate-900">{{ file.name }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ file.size || 0 }} bytes</p>
      </div>
    </button>
  </div>
</template>

<script setup>
/**
 * @file media/components/MediaGrid.vue
 * @description Generic media asset grid for starter media library pages.
 */
defineProps({ files: { type: Array, default: () => [] } })
defineEmits(['select'])
</script>
