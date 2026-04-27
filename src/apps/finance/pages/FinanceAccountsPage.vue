<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Ledger Design"
      title="Chart of accounts"
      description="Finance accounts are structured for balance sheet, income statement, expense statement, and controlled posting rules."
    />

    <div class="grid gap-6 xl:grid-cols-2">
      <section
        v-for="group in accountGroups"
        :key="group.key"
        class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
              {{ group.label }}
            </p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
              {{ group.rows.length }} accounts
            </h2>
          </div>
        </div>

        <div class="mt-5 overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Code
                </th>
                <th class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Name
                </th>
                <th class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Normal Side
                </th>
                <th class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Scope
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="account in group.rows"
                :key="account.id"
                class="transition hover:bg-[var(--color-neutral,#F8FAFC)]"
              >
                <td class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-4 text-sm font-medium text-[var(--color-text,#0F172A)]">
                  {{ account.code }}
                </td>
                <td class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-4 text-sm text-[var(--color-text,#0F172A)]">
                  <div>
                    <p class="font-medium">{{ account.name }}</p>
                    <p class="mt-1 text-xs text-[var(--color-text-light,#64748B)]">
                      {{ account.description || 'No description yet.' }}
                    </p>
                  </div>
                </td>
                <td class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-4 text-sm text-[var(--color-text,#0F172A)]">
                  {{ account.normalSide }}
                </td>
                <td class="border-b border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-4 text-sm text-[var(--color-text,#0F172A)]">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                    :class="account.isSystem ? 'bg-sky-50 text-sky-700' : 'bg-[var(--color-neutral,#F8FAFC)] text-[var(--color-text-light,#64748B)]'"
                  >
                    {{ account.isSystem ? 'system' : 'custom' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceAccountsPage.vue
 * @description Chart of accounts page.
 */

import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import FinancePageHeader from '../components/FinancePageHeader.vue'
import { useFinanceAppStore } from '../stores/useFinanceAppStore.js'

const store = useFinanceAppStore()
store.ensureReady().catch(() => {})

useHead({
  title: 'Chart of Accounts',
  meta: [
    {
      name: 'description',
      content: 'Finance accounts powering posting rules and finance statements.',
    },
  ],
})

const labels = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
}

const accountGroups = computed(() => Object.entries(labels).map(([key, label]) => ({
  key,
  label,
  rows: store.accounts
    .filter((account) => account.type === key)
    .sort((a, b) => String(a.code || '').localeCompare(String(b.code || ''))),
})))
</script>
