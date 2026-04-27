<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Statement"
      title="Expense statement"
      description="Expense accounts grouped for cleaner operational cost analysis."
    >
      <template #actions>
        <RouterLink
          to="/finance/reports"
          class="inline-flex items-center justify-center rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-5 py-3 text-sm font-semibold text-[var(--color-text,#0F172A)] transition hover:bg-white"
        >
          Back to reports
        </RouterLink>
      </template>
    </FinancePageHeader>

    <FinanceStatementTable
      title="Expense accounts"
      description="Cost movement by expense account, derived from posted ledger entries only."
      :rows="store.expenseStatement.rows"
      :columns="columns"
      total-label="Total expenses"
      :total-value="store.expenseStatement.totalExpenses"
    />

    <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
        Finance note
      </p>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-light,#64748B)]">
        Expense accounts should remain specific enough for reporting but not so fragmented that every minor cost needs a new account.
      </p>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceExpenseStatementPage.vue
 * @description Expense statement page.
 */

import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import FinancePageHeader from '../components/FinancePageHeader.vue'
import FinanceStatementTable from '../components/FinanceStatementTable.vue'
import { useFinanceAppStore } from '../stores/useFinanceAppStore.js'

const store = useFinanceAppStore()
store.ensureReady().catch(() => {})

useHead({
  title: 'Expense Statement',
  meta: [
    {
      name: 'description',
      content: 'Expense statement grouped by account from posted finance entries.',
    },
  ],
})

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Expense Account' },
  { key: 'amount', label: 'Amount', format: 'currency' },
]
</script>
