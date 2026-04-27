<template>
  <section class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
    <div class="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 class="text-xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-1 text-sm text-[var(--color-text-light,#64748B)]">
          {{ description }}
        </p>
      </div>

      <div v-if="typeof totalValue === 'number'" class="text-right">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
          {{ totalLabel }}
        </p>
        <p class="mt-1 text-lg font-semibold text-[var(--color-text,#0F172A)]">
          {{ formatMoney(totalValue, currency) }}
        </p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="!rows.length">
            <td
              :colspan="columns.length"
              class="px-4 py-10 text-center text-sm text-[var(--color-text-light,#64748B)]"
            >
              No rows available for this statement.
            </td>
          </tr>

          <tr
            v-for="row in rows"
            :key="row.accountId || row.id || row.code || row.name"
            class="transition hover:bg-[var(--color-neutral,#F8FAFC)]"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-4 text-sm text-[var(--color-text,#0F172A)]"
            >
              <span v-if="column.format === 'currency'">
                {{ formatMoney(row[column.key], currency) }}
              </span>
              <span v-else>
                {{ row[column.key] ?? '—' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceStatementTable.vue
 * @description Reusable finance statement table.
 */

import { formatMoney } from '../services/financeFormatters.js'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  totalLabel: {
    type: String,
    default: 'Total',
  },
  totalValue: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: 'NAD',
  },
})
</script>
