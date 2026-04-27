<template>
  <section class="min-h-full space-y-6 bg-[var(--color-neutral,#F8FAFC)] p-4 md:p-6">
    <FinancePageHeader
      eyebrow="Finance PDFs"
      title="Client-facing finance documents"
      description="Generate invoices, quotations, receipts, payment confirmations, payout statements, and statements from structured finance data. Ledger stays the source of truth; PDFs are the client-facing output."
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary,#1860A8)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="isGenerating"
          @click="generatePdf"
        >
          {{ isGenerating ? 'Generating…' : 'Generate PDF' }}
        </button>
      </template>
    </FinancePageHeader>

    <div class="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <article class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
          Document Type
        </p>
        <h2 class="mt-3 text-xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
          Select PDF output
        </h2>

        <div class="mt-5 grid gap-3">
          <button
            v-for="option in documentTypes"
            :key="option.value"
            type="button"
            :class="[
              'rounded-2xl border px-4 py-3 text-left text-sm transition',
              documentType === option.value
                ? 'border-[var(--color-primary,#1860A8)] bg-white ring-2 ring-[var(--color-primary,#1860A8)]'
                : 'border-[var(--color-neutral-dark,#E2E8F0)] bg-white hover:bg-slate-50',
            ]"
            @click="selectType(option.value)"
          >
            <span class="font-semibold text-[var(--color-text,#0F172A)]">{{ option.label }}</span>
            <span class="mt-1 block text-xs leading-5 text-[var(--color-text-light,#64748B)]">{{ option.description }}</span>
          </button>
        </div>
      </article>

      <article class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
              Payload
            </p>
            <h2 class="mt-3 text-xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
              Structured document data
            </h2>
          </div>
          <button
            type="button"
            class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-xs font-semibold text-[var(--color-text,#0F172A)]"
            @click="resetExample"
          >
            Reset example
          </button>
        </div>

        <textarea
          v-model="jsonPayload"
          class="mt-5 min-h-[420px] w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] bg-slate-50 p-4 font-mono text-xs leading-6 text-[var(--color-text,#0F172A)] outline-none focus:border-[var(--color-primary,#1860A8)]"
          spellcheck="false"
        />

        <p v-if="error" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ error }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/pages/FinanceDocumentsPage.vue
 * @description Finance PDF generator workspace.
 */

import { ref } from 'vue'
import FinancePageHeader from '../components/FinancePageHeader.vue'
import { downloadFinanceDocumentPdf } from '../services/financePdfEngine.js'

const documentTypes = [
  { value: 'invoice', label: 'Invoice', description: 'Bill a client for approved services.' },
  { value: 'quotation', label: 'Quotation', description: 'Quote a client before work starts.' },
  { value: 'receipt', label: 'Receipt', description: 'Confirm money received.' },
  { value: 'payment', label: 'Payment confirmation', description: 'Generate payment proof or confirmation.' },
  { value: 'payout', label: 'Payout statement', description: 'Summarise consultant or vendor payout.' },
  { value: 'statement', label: 'Statement', description: 'Generate a client or account statement.' },
]

const examples = {
  invoice: {
    invoiceCode: 'INV-0001',
    clientName: 'Client Name',
    clientEmail: 'client@example.com',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'draft',
    currency: 'NAD',
    lineItems: [
      { description: 'Website development', quantity: 1, unitPrice: 4500 },
      { description: 'Domain and email setup', quantity: 1, unitPrice: 600 },
    ],
    notes: 'Payment due before final handover.',
  },
  quotation: {
    quoteCode: 'QTE-0001',
    clientName: 'Client Name',
    issueDate: new Date().toISOString(),
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: 'draft',
    currency: 'NAD',
    depositAmount: 2250,
    lineItems: [
      { description: 'Listing website first version', quantity: 1, unitPrice: 4500 },
      { description: 'Annual maintenance', quantity: 1, unitPrice: 600 },
    ],
    terms: 'Scope changes are quoted separately before implementation.',
  },
  receipt: {
    receiptCode: 'RCT-0001',
    clientName: 'Client Name',
    issueDate: new Date().toISOString(),
    paymentMethod: 'Bank transfer',
    status: 'paid',
    currency: 'NAD',
    receivedAmount: 2250,
    lineItems: [{ description: 'Project deposit received', quantity: 1, unitPrice: 2250 }],
  },
  payment: {
    paymentCode: 'PAY-0001',
    clientName: 'Client Name',
    issueDate: new Date().toISOString(),
    paymentMethod: 'Cash',
    status: 'confirmed',
    currency: 'NAD',
    paidAmount: 1000,
    lineItems: [{ description: 'Payment received', quantity: 1, unitPrice: 1000 }],
  },
  payout: {
    payoutCode: 'PAYOUT-0001',
    consultantLabel: 'Consultant Name',
    issueDate: new Date().toISOString(),
    status: 'approved',
    currency: 'NAD',
    totalAmount: 1800,
    lineItems: [{ description: 'Consultant share', quantity: 1, unitPrice: 1800 }],
  },
  statement: {
    documentCode: 'STM-0001',
    clientName: 'Client Name',
    issueDate: new Date().toISOString(),
    currency: 'NAD',
    status: 'open',
    lineItems: [
      { description: 'Invoice INV-0001', quantity: 1, unitPrice: 4500 },
      { description: 'Payment RCT-0001', quantity: 1, unitPrice: -2250 },
    ],
    totalAmount: 2250,
  },
}

const documentType = ref('invoice')
const jsonPayload = ref(JSON.stringify(examples.invoice, null, 2))
const error = ref('')
const isGenerating = ref(false)

function selectType(type) {
  documentType.value = type
  jsonPayload.value = JSON.stringify(examples[type] || examples.invoice, null, 2)
  error.value = ''
}

function resetExample() {
  jsonPayload.value = JSON.stringify(examples[documentType.value] || examples.invoice, null, 2)
  error.value = ''
}

async function generatePdf() {
  isGenerating.value = true
  error.value = ''
  try {
    const payload = JSON.parse(jsonPayload.value)
    await downloadFinanceDocumentPdf({ type: documentType.value, data: payload })
  } catch (caughtError) {
    error.value = caughtError?.message || 'Failed to generate finance PDF.'
  } finally {
    isGenerating.value = false
  }
}
</script>
