<template>
  <ol class="space-y-4">
    <li
      v-for="entry in items"
      :key="entry.id || `${entry.type}-${entry.createdAt}`"
      class="flex gap-4"
    >
      <div class="mt-2 h-2.5 w-2.5 rounded-full bg-slate-900"></div>
      <div class="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">
              {{ entry.action || entry.type || 'Activity' }}
            </p>
            <p class="mt-1 text-sm text-slate-600">
              {{ entry.description || 'No description provided.' }}
            </p>
          </div>
          <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
            {{ entry.priority || 'medium' }}
          </span>
        </div>
        <div class="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em] text-slate-400">
          <span>{{ entry.type || 'note' }}</span>
          <span>{{ formatDate(entry.createdAt) }}</span>
        </div>
      </div>
    </li>

    <li v-if="items.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
      No timeline entries yet.
    </li>
  </ol>
</template>

<script setup>
/**
 * @file ActivityTimeline.vue
 * @description Generic activity timeline component.
 */

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

/**
 * Format a possibly mixed date value.
 *
 * @param {unknown} value
 * @returns {string}
 */
function formatDate(value) {
  if (!value) return 'No date'

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>
