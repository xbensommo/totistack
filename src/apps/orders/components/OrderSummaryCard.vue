<template>
  <aside class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order summary</p>
        <h2 class="mt-2 text-xl font-semibold text-slate-950">{{ order?.orderNumber || 'Draft order' }}</h2>
      </div>
      <StatusBadge :status="order?.status || 'pending'" />
    </div>

    <dl class="mt-5 space-y-3 text-sm">
      <div class="flex items-center justify-between gap-3 text-slate-600">
        <dt>Subtotal</dt>
        <dd class="font-medium text-slate-900">{{ formatMoney(order?.subtotal, order?.currency) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 text-slate-600">
        <dt>Discount</dt>
        <dd class="font-medium text-slate-900">{{ formatMoney(order?.discount, order?.currency) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 text-slate-600">
        <dt>Tax</dt>
        <dd class="font-medium text-slate-900">{{ formatMoney(order?.tax, order?.currency) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 text-slate-600">
        <dt>Shipping</dt>
        <dd class="font-medium text-slate-900">{{ formatMoney(order?.shipping, order?.currency) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base text-slate-950">
        <dt class="font-semibold">Total</dt>
        <dd class="font-semibold">{{ formatMoney(order?.total, order?.currency) }}</dd>
      </div>
    </dl>

    <div class="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
      <div class="flex items-center justify-between gap-3">
        <span class="text-slate-500">Payment</span>
        <StatusBadge :status="order?.paymentStatus || 'pending'" variant="payment" />
      </div>
      <p class="mt-3 text-slate-600">
        {{ order?.paymentMethod || 'No payment method captured yet.' }}
      </p>
    </div>
  </aside>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  order: {
    type: Object,
    default: () => null,
  },
})

function formatMoney(value, currency = 'USD') {
  const amount = Number(value || 0)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}
</script>
