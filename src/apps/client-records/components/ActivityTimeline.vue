<template>
  <ol class="space-y-4">
    <li
      v-for="entry in items"
      :key="entry.id || `${entry.type}-${entry.createdAt}`"
      class="flex gap-4"
    >
      <div class="relative flex flex-col items-center">
        <div class="mt-2 h-3 w-3 rounded-full bg-brand-gradient shadow-theme-glow"></div>
        <div class="mt-2 h-full min-h-8 w-px bg-[var(--color-border)]"></div>
      </div>
      <div class="card card-hover min-w-0 flex-1 p-4 md:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-[var(--color-text)]">
              {{ entry.action || entry.type || 'Activity' }}
            </p>
            <p class="text-sm text-muted">
              {{ entry.description || 'No description provided.' }}
            </p>
          </div>
          <span class="badge badge-primary">
            {{ entry.priority || 'medium' }}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-3 text-caption">
          <span>{{ entry.type || 'note' }}</span>
          <span>{{ formatDate(entry.createdAt) }}</span>
        </div>
      </div>
    </li>

    <li v-if="items.length === 0" class="empty-state px-5 py-8 text-sm">
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
