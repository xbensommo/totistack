<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Statement"
      title="Balance sheet"
      description="Assets, liabilities, and equity generated from posted finance entries."
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
        title="Assets"
        description="Current and non-current assets recognized by the ledger."
        :rows="store.balanceSheet.assets"
        :columns="columns"
        total-label="Total assets"
        :total-value="store.balanceSheet.totalAssets"
      />
      <div class="space-y-6">
        <FinanceStatementTable
          title="Liabilities"
          description="Amounts owed or payable from posted finance events."
          :rows="store.balanceSheet.liabilities"
          :columns="columns"
          total-label="Total liabilities"
          :total-value="store.balanceSheet.totalLiabilities"
        />
        <FinanceStatementTable
          title="Equity"
          description="Owner and retained finance position recognized in the ledger."
          :rows="store.balanceSheet.equity"
          :columns="columns"
          total-label="Total equity"
          :total-value="store.balanceSheet.totalEquity"
        />
      </div>
    </div>

    <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-[22px] bg-[var(--color-neutral,#F8FAFC)] p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
            Total Assets
          </p>
          <p class="mt-2 text-2xl font-semibold text-[var(--color-text,#0F172A)]">
            {{ formatMoney(store.balanceSheet.totalAssets) }}
          </p>
        </div>
        <div class="rounded-[22px] bg-[var(--color-neutral,#F8FAFC)] p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-light,#64748B)]">
            Liabilities + Equity
          </p>
          <p class="mt-2 text-2xl font-semibold text-[var(--color-text,#0F172A)]">
            {{ formatMoney(store.balanceSheet.liabilitiesAndEquity) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceBalanceSheetPage.vue
 * @description Balance sheet page.
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
  title: 'Balance Sheet',
  meta: [
    {
      name: 'description',
      content: 'Balance sheet derived from finance ledger entries.',
    },
  ],
})

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Account' },
  { key: 'amount', label: 'Amount', format: 'currency' },
]
</script>
