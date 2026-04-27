<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Totistack Finance"
      title="Finance dashboard"
      description="Ledger-first finance for Totistack. Posted entries drive balance sheet, income statement, and expense visibility."
    >
      <template #actions>
        <RouterLink
          to="/finance/reports"
          class="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent,#000000)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Open reports
        </RouterLink>
      </template>
    </FinancePageHeader>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FinanceKpiCard
        label="Posted Transactions"
        :value="String(store.dashboardMetrics.postedTransactions)"
        badge="ledger"
        hint="Transactions already affecting reports and balances."
      />
      <FinanceKpiCard
        label="Draft Queue"
        :value="String(store.dashboardMetrics.draftTransactions)"
        badge="pending"
        tone="attention"
        hint="Draft records still waiting for review or posting."
      />
      <FinanceKpiCard
        label="Net Income"
        :value="formatMoney(store.dashboardMetrics.netIncome)"
        badge="current"
        :tone="store.dashboardMetrics.netIncome >= 0 ? 'positive' : 'attention'"
        hint="Revenue minus expense movement from posted entries."
      />
      <FinanceKpiCard
        label="Total Assets"
        :value="formatMoney(store.dashboardMetrics.assets)"
        badge="snapshot"
        hint="Ledger-derived asset position from current posted entries."
      />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <section class="space-y-6">
        <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
          <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
                Core reports
              </p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
                Financial statements
              </h2>
              <p class="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-text-light,#64748B)]">
                Balance sheet, income statement, and expense statement are generated from the same posted ledger source.
              </p>
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <RouterLink
              to="/finance/reports/balance-sheet"
              class="rounded-[24px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
                Balance Sheet
              </p>
              <p class="mt-4 text-lg font-semibold text-[var(--color-text,#0F172A)]">
                {{ formatMoney(store.balanceSheet.totalAssets) }}
              </p>
              <p class="mt-2 text-sm text-[var(--color-text-light,#64748B)]">
                Assets vs liabilities and equity.
              </p>
            </RouterLink>

            <RouterLink
              to="/finance/reports/income-statement"
              class="rounded-[24px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
                Income Statement
              </p>
              <p class="mt-4 text-lg font-semibold text-[var(--color-text,#0F172A)]">
                {{ formatMoney(store.incomeStatement.netIncome) }}
              </p>
              <p class="mt-2 text-sm text-[var(--color-text-light,#64748B)]">
                Revenue, expense, and net result.
              </p>
            </RouterLink>

            <RouterLink
              to="/finance/reports/expense-statement"
              class="rounded-[24px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
                Expense Statement
              </p>
              <p class="mt-4 text-lg font-semibold text-[var(--color-text,#0F172A)]">
                {{ formatMoney(store.expenseStatement.totalExpenses) }}
              </p>
              <p class="mt-2 text-sm text-[var(--color-text-light,#64748B)]">
                Operational cost visibility by account.
              </p>
            </RouterLink>
          </div>
        </div>

        <FinanceStatementTable
          title="Recent ledger entries"
          description="Latest posted or reversal entries already reflected in reports."
          :rows="ledgerRows"
          :columns="ledgerColumns"
        />
      </section>

      <section class="space-y-6">
        <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
          <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
            Period controls
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
            Accounting periods
          </h2>

          <div class="mt-5 space-y-3">
            <div
              v-for="period in store.periods"
              :key="period.id"
              class="flex items-center justify-between rounded-[20px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] px-4 py-4"
            >
              <div>
                <p class="font-semibold text-[var(--color-text,#0F172A)]">{{ period.label }}</p>
                <p class="mt-1 text-sm text-[var(--color-text-light,#64748B)]">
                  {{ formatDate(period.startsOn) }} — {{ formatDate(period.endsOn) }}
                </p>
              </div>
              <FinanceStatusBadge :status="period.status" />
            </div>
          </div>
        </div>

        <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
          <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
            Snapshot
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
            Balance structure
          </h2>

          <div class="mt-6 space-y-4">
            <div class="rounded-[22px] bg-[var(--color-neutral,#F8FAFC)] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
                Assets
              </p>
              <p class="mt-2 text-2xl font-semibold text-[var(--color-text,#0F172A)]">
                {{ formatMoney(store.balanceSnapshot.assets) }}
              </p>
            </div>
            <div class="rounded-[22px] bg-[var(--color-neutral,#F8FAFC)] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
                Liabilities
              </p>
              <p class="mt-2 text-2xl font-semibold text-[var(--color-text,#0F172A)]">
                {{ formatMoney(store.balanceSnapshot.liabilities) }}
              </p>
            </div>
            <div class="rounded-[22px] bg-[var(--color-neutral,#F8FAFC)] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
                Equity
              </p>
              <p class="mt-2 text-2xl font-semibold text-[var(--color-text,#0F172A)]">
                {{ formatMoney(store.balanceSnapshot.equity) }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceDashboardPage.vue
 * @description Finance dashboard.
 */

import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import FinanceKpiCard from '../components/FinanceKpiCard.vue'
import FinancePageHeader from '../components/FinancePageHeader.vue'
import FinanceStatementTable from '../components/FinanceStatementTable.vue'
import FinanceStatusBadge from '../components/FinanceStatusBadge.vue'
import { formatDate, formatMoney } from '../services/financeFormatters.js'
import { useFinanceAppStore } from '../stores/useFinanceAppStore.js'

const store = useFinanceAppStore()
store.ensureReady().catch(() => {})

useHead({
  title: 'Finance Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Finance dashboard with ledger-driven balance, income, expense, and period visibility.',
    },
  ],
})

const ledgerColumns = [
  { key: 'postedAt', label: 'Posted' },
  { key: 'reference', label: 'Reference' },
  { key: 'memo', label: 'Memo' },
  { key: 'totalDebit', label: 'Debit', format: 'currency' },
  { key: 'totalCredit', label: 'Credit', format: 'currency' },
]

const ledgerRows = computed(() => store.recentJournalEntries.map((entry) => ({
  id: entry.id,
  postedAt: formatDate(entry.postedAt),
  reference: entry.transactionId,
  memo: entry.memo || entry.transactionType,
  totalDebit: entry.totalDebit,
  totalCredit: entry.totalCredit,
})))
</script>
