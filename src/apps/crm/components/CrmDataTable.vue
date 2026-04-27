<template>
  <div class="table-wrap">
    <div class="overflow-x-auto">
      <table class="table-base">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length">
              <div class="empty-state rounded-none border-0 shadow-none">
                <i class="fa fa-folder-open text-3xl text-muted opacity-50"></i>
                <span class="mt-3 text-sm font-medium text-muted">{{ emptyText }}</span>
              </div>
            </td>
          </tr>

          <tr v-for="row in rows" :key="row.id || row._key || JSON.stringify(row)">
            <td
              v-for="column in columns"
              :key="`${row.id || row._key || 'row'}-${column.key}`"
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
