<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Statement"
      title="Income statement"
      description="Revenue and expense performance derived from posted ledger activity."
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

    <div class="grid gap-6 xl:grid-cols-2">
      <FinanceStatementTable
        title="Revenue"
        description="Revenue accounts contributing to the current reporting position."
        :rows="store.incomeStatement.revenueRows"
        :columns="columns"
        total-label="Total revenue"
        :total-value="store.incomeStatement.revenue"
      />
      <FinanceStatementTable
        title="Expenses"
        description="Expense accounts recognized against revenue."
        :rows="store.incomeStatement.expenseRows"
        :columns="columns"
        total-label="Total expenses"
        :total-value="store.incomeStatement.expenses"
      />
    </div>

    <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
        Net result
      </p>
      <h2 class="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
        {{ formatMoney(store.incomeStatement.netIncome) }}
      </h2>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-light,#64748B)]">
        Positive values indicate profitable posted activity. Negative values indicate a current-period finance loss.
      </p>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceIncomeStatementPage.vue
 * @description Income statement page.
 */

import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import FinancePageHeader from '../components/FinancePageHeader.vue'
import FinanceStatementTable from '../components/FinanceStatementTable.vue'
import { formatMoney } from '../services/financeFormatters.js'
import { useFinanceAppStore } from '../stores/useFinanceAppStore.js'

const store = useFinanceAppStore()
store.ensureReady().catch(() => {})

useHead({
  title: 'Income Statement',
  meta: [
    {
      name: 'description',
      content: 'Income statement built from posted finance ledger entries.',
    },
  ],
})

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Account' },
  { key: 'amount', label: 'Amount', format: 'currency' },
]
</script>
