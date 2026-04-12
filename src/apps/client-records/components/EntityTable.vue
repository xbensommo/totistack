<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="row in rows" :key="row.id || row._key || JSON.stringify(row)">
            <td
              v-for="column in columns"
              :key="column.key"
              class="whitespace-nowrap px-4 py-4 text-sm text-slate-700"
            >
              <slot :name="`cell:${column.key}`" :row="row" :value="row[column.key]">
                {{ formatValue(row[column.key]) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-4 py-4 text-right text-sm">
              <slot name="actions" :row="row" />
            </td>
          </tr>

          <tr v-if="rows.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-8 text-center text-sm text-slate-500">
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
/**
 * @file EntityTable.vue
 * @description Generic table for starter CRUD modules.
 */

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No records found.',
  },
})

/**
 * Format cell values for default rendering.
 *
 * @param {unknown} value
 * @returns {string}
 */
function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>
