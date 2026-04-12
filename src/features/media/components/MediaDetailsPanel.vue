<template>
  <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="text-lg font-semibold text-slate-900">Asset details</h3>
    <template v-if="file">
      <dl class="mt-4 space-y-3 text-sm text-slate-600">
        <div>
          <dt class="font-semibold text-slate-800">Name</dt>
          <dd>{{ file.name }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-slate-800">Path</dt>
          <dd class="break-all">{{ file.storagePath }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-slate-800">Mime type</dt>
          <dd>{{ file.mimeType }}</dd>
        </div>
      </dl>
    </template>
    <p v-else class="mt-3 text-sm text-slate-500">Select an asset from the grid to review its metadata.</p>
  </aside>
</template>

<script setup>
/**
 * @file media/components/MediaDetailsPanel.vue
 * @description Starter asset detail panel for the media library page.
 */
defineProps({ file: { type: Object, default: null } })
</script>
