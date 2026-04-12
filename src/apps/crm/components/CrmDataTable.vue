<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left font-semibold text-slate-600"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-10 text-center text-slate-500">
              {{ emptyText }}
            </td>
          </tr>
          <tr v-for="row in rows" :key="row.id || row._key || JSON.stringify(row)">
            <td
              v-for="column in columns"
              :key="`${row.id || row._key || 'row'}-${column.key}`"
              class="px-4 py-3 align-top text-slate-700"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
/**
 * Reusable and extendable CRM table.
 */
defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No records found.',
  },
});
</script>
