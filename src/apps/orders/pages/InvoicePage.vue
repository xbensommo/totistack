<template>
  <div class="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <RouterLink
        to="/orders"
        class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Back to orders
      </RouterLink>
      <button
        type="button"
        class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 print:hidden"
        @click="printInvoice"
      >
        Print invoice
      </button>
    </div>

    <article class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header class="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Invoice</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ invoice?.orderNumber || 'Invoice' }}</h1>
          <p class="mt-2 text-sm text-slate-500">Issued {{ formatDate(invoice?.issueDate) }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount due</p>
          <p class="mt-2 text-2xl font-semibold text-slate-950">{{ formatMoney(invoice?.total, invoice?.currency) }}</p>
        </div>
      </header>

      <div v-if="invoice" class="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bill to</p>
          <p class="mt-3 text-sm leading-6 text-slate-700">{{ formatAddress(invoice.shippingAddress) }}</p>
        </section>
        <section>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment status</p>
          <p class="mt-3 text-sm leading-6 text-slate-700 capitalize">{{ invoice.paymentStatus || 'pending' }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-700">Method: {{ invoice.paymentMethod || 'Not captured yet' }}</p>
        </section>
      </div>

      <div class="mt-8 overflow-hidden rounded-[24px] border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50/80">
            <tr>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Item</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Qty</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Price</th>
              <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="(item, index) in invoice?.lineItems || []" :key="item.productId || item.sku || index">
              <td class="px-4 py-4 text-sm text-slate-900">{{ item.title || 'Untitled item' }}</td>
              <td class="px-4 py-4 text-sm text-slate-700">{{ item.quantity || 1 }}</td>
              <td class="px-4 py-4 text-sm text-slate-700">{{ formatMoney(item.price, invoice?.currency) }}</td>
              <td class="px-4 py-4 text-right text-sm font-medium text-slate-900">{{ formatMoney(item.subtotal, invoice?.currency) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-8 ml-auto max-w-sm space-y-3 text-sm">
        <div class="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span class="font-medium text-slate-900">{{ formatMoney(invoice?.subtotal, invoice?.currency) }}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span>Discount</span>
          <span class="font-medium text-slate-900">{{ formatMoney(invoice?.discount, invoice?.currency) }}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span>Tax</span>
          <span class="font-medium text-slate-900">{{ formatMoney(invoice?.tax, invoice?.currency) }}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span class="font-medium text-slate-900">{{ formatMoney(invoice?.shipping, invoice?.currency) }}</span>
        </div>
        <div class="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
          <span>Total</span>
          <span>{{ formatMoney(invoice?.total, invoice?.currency) }}</span>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import { createOrderServices } from '../services/orderService.js'

const route = useRoute()
const store = useAppStore()
const orderService = createOrderServices({ store })
const invoice = ref(null)

onMounted(async () => {
  try {
    invoice.value = await orderService.getInvoiceSummary(route.params.id)
  } catch (error) {
    console.error('[InvoicePage] Failed to load invoice.', error)
    invoice.value = null
  }
})

function printInvoice() {
  window.print()
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function formatAddress(address) {
  if (!address) return 'No billing details captured.'
  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.address1,
    address.address2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
    address.email,
  ]
    .filter(Boolean)
    .join(', ')
}
</script>
