<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Finance Reports"
      title="Statements and summaries"
      description="Every report below reads from the posted ledger. No hand-edited balances and no disconnected report math."
    />

    <div class="grid gap-5 xl:grid-cols-3">
      <RouterLink
        to="/finance/reports/balance-sheet"
        class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.08)]"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
          Balance Sheet
        </p>
        <h2 class="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
          {{ formatMoney(store.balanceSheet.totalAssets) }}
        </h2>
        <p class="mt-3 text-sm leading-7 text-[var(--color-text-light,#64748B)]">
          View assets, liabilities, and equity in one structured statement.
        </p>
      </RouterLink>

      <RouterLink
        to="/finance/reports/income-statement"
        class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.08)]"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
          Income Statement
        </p>
        <h2 class="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
          {{ formatMoney(store.incomeStatement.netIncome) }}
        </h2>
        <p class="mt-3 text-sm leading-7 text-[var(--color-text-light,#64748B)]">
          Track revenue, expense, and net result from posted entries only.
        </p>
      </RouterLink>

      <RouterLink
        to="/finance/reports/expense-statement"
        class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.08)]"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
          Expense Statement
        </p>
        <h2 class="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
          {{ formatMoney(store.expenseStatement.totalExpenses) }}
        </h2>
        <p class="mt-3 text-sm leading-7 text-[var(--color-text-light,#64748B)]">
          Review cost structure per expense account for finance control.
        </p>
      </RouterLink>
    </div>

    <FinanceStatementTable
      title="Trial balance"
      description="A quick control report to verify debit and credit totals remain aligned."
      :rows="store.trialBalance.rows"
      :columns="trialBalanceColumns"
      total-label="Total debit"
      :total-value="store.trialBalance.totalDebit"
    />
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceReportsPage.vue
 * @description Finance reports landing page.
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
  title: 'Finance Reports',
  meta: [
    {
      name: 'description',
      content: 'Ledger-derived finance statements including balance sheet, income statement, and expense statement.',
    },
  ],
})

const trialBalanceColumns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Account' },
  { key: 'debit', label: 'Debit', format: 'currency' },
  { key: 'credit', label: 'Credit', format: 'currency' },
]
</script>
