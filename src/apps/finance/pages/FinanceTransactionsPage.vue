<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Finance Workflow"
      title="Transactions and posting flow"
      description="Drafts are reviewed, posted into the ledger, and reversed through explicit finance actions. Closed periods block new posting."
    />

    <div
      v-if="store.error"
      class="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ store.error.message }}
    </div>

    <FinanceFilterBar
      :search="store.filters.search"
      :status="store.filters.status"
      :type="store.filters.type"
      :status-options="statusOptions"
      :type-options="typeOptions"
      @update:search="store.setFilters({ search: $event })"
      @update:status="store.setFilters({ status: $event })"
      @update:type="store.setFilters({ type: $event })"
    />

    <div class="grid gap-5">
      <article
        v-for="transaction in store.filteredTransactions"
        :key="transaction.id"
        class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]"
      >
        <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <p class="text-lg font-semibold text-[var(--color-text,#0F172A)]">
                {{ transaction.reference || transaction.id }}
              </p>
              <FinanceStatusBadge :status="transaction.status" />
            </div>

            <dl class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Type
                </dt>
                <dd class="mt-2 text-sm font-medium text-[var(--color-text,#0F172A)]">
                  {{ transaction.type }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Occurred on
                </dt>
                <dd class="mt-2 text-sm font-medium text-[var(--color-text,#0F172A)]">
                  {{ formatDate(transaction.occurredOn) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Amount
                </dt>
                <dd class="mt-2 text-sm font-medium text-[var(--color-text,#0F172A)]">
                  {{ formatMoney(transaction.amount) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Memo
                </dt>
                <dd class="mt-2 text-sm text-[var(--color-text,#0F172A)]">
                  {{ transaction.memo || 'No memo provided.' }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Business link
                </dt>
                <dd class="mt-2 text-sm text-[var(--color-text,#0F172A)]">
                  {{ transaction.sourceType || 'manual' }} {{ transaction.sourceId || transaction.sourceRef || '' }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                  Ledger link
                </dt>
                <dd class="mt-2 text-sm font-medium text-[var(--color-text,#0F172A)]">
                  {{ transaction.postedJournalEntryId || transaction.reversalJournalEntryId || 'Not yet posted' }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="w-full max-w-md">
            <FinanceActionPanel
              :title="actionTitle(transaction)"
              :description="actionDescription(transaction)"
              :show-review="store.canReviewTransaction(transaction)"
              :show-post="store.canPostTransaction(transaction)"
              :confirm-action="passthroughConfirm"
              @review="handleReview(transaction.id)"
              @post="handlePost(transaction.id)"
            />
          </div>
        </div>
      </article>
    </div>

    <div class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
            Ledger reversals
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
            Posted entries
          </h2>
        </div>
      </div>

      <div class="mt-5 grid gap-4">
        <article
          v-for="entry in reversibleEntries"
          :key="entry.id"
          class="rounded-[22px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] p-5"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <p class="font-semibold text-[var(--color-text,#0F172A)]">{{ entry.id }}</p>
                <FinanceStatusBadge :status="entry.status" />
              </div>
              <p class="mt-2 text-sm text-[var(--color-text-light,#64748B)]">
                {{ entry.memo || entry.transactionType }} · {{ formatDate(entry.postedAt) }}
              </p>
            </div>

            <div class="w-full max-w-md">
              <FinanceActionPanel
                title="Reverse entry"
                description="Use reversal instead of delete so the audit trail remains intact. Closed periods still block reversal posting."
                :confirm-action="passthroughConfirm"
                :show-reverse="store.canReverseJournalEntry(entry)"
                @reverse="handleReverse(entry.id)"
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceTransactionsPage.vue
 * @description Finance transactions and action flow.
 */

import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import FinanceActionPanel from '../components/FinanceActionPanel.vue'
import FinanceFilterBar from '../components/FinanceFilterBar.vue'
import FinancePageHeader from '../components/FinancePageHeader.vue'
import FinanceStatusBadge from '../components/FinanceStatusBadge.vue'
import { formatDate, formatMoney } from '../services/financeFormatters.js'
import { useFinanceAppStore } from '../stores/useFinanceAppStore.js'

const store = useFinanceAppStore()
store.ensureReady().catch(() => {})

useHead({
  title: 'Finance Transactions',
  meta: [
    {
      name: 'description',
      content: 'Review, post, and reverse finance transactions with a confirm-first workflow.',
    },
  ],
})

const statusOptions = ['draft', 'reviewed', 'posted', 'reversed', 'cancelled']
const typeOptions = [
  'invoice',
  'receipt',
  'payment',
  'bill',
  'supplier_payment',
  'expense',
  'payout',
  'payout_accrual',
  'payout_payment',
  'refund',
  'transfer',
  'adjustment',
]

const reversibleEntries = computed(() => store.journalEntries.filter((entry) => entry.status === 'posted'))
const passthroughConfirm = async () => true

function actionTitle(transaction) {
  if (transaction.status === 'draft') return 'Review or post draft'
  if (transaction.status === 'reviewed') return 'Post reviewed transaction'
  return 'No open action'
}

function actionDescription(transaction) {
  if (transaction.status === 'draft') {
    return 'Drafts can be reviewed first or posted directly by authorized finance staff.'
  }

  if (transaction.status === 'reviewed') {
    return 'This record is reviewed and ready to affect the ledger.'
  }

  return 'This record already reached a final finance state.'
}

async function handleReview(transactionId) {
  await store.reviewTransaction(transactionId)
}

async function handlePost(transactionId) {
  await store.postTransaction(transactionId)
}

async function handleReverse(entryId) {
  await store.reverseJournalEntry(entryId)
}
</script>
