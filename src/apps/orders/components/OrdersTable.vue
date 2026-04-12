<template>
  <div class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50/80">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="item in items" :key="item.id || item.orderNumber" class="group transition hover:bg-slate-50/80">
            <td class="px-4 py-4 align-top">
              <div class="font-semibold text-slate-950">{{ item.orderNumber || '—' }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ formatDate(item.createdAt) }}</div>
            </td>
            <td class="px-4 py-4 align-top">
              <div class="font-medium text-slate-900">{{ item.shippingAddress?.firstName || item.customerName || 'Customer' }} {{ item.shippingAddress?.lastName || '' }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.shippingAddress?.email || item.customerEmail || item.clientId || 'No email' }}</div>
            </td>
            <td class="px-4 py-4 align-top text-sm text-slate-700">
              <div>{{ item.items?.length || 0 }} items</div>
              <div class="mt-1 text-xs text-slate-500">{{ firstItemTitle(item.items) }}</div>
            </td>
            <td class="px-4 py-4 align-top text-sm text-slate-700">
              {{ formatMoney(item.total, item.currency) }}
            </td>
            <td class="px-4 py-4 align-top">
              <StatusBadge :status="item.status || 'pending'" />
            </td>
            <td class="px-4 py-4 align-top">
              <StatusBadge :status="item.paymentStatus || 'pending'" variant="payment" />
            </td>
            <td class="px-4 py-4 align-top text-right text-sm text-slate-700">
              <slot name="actions" :item="item" />
            </td>
          </tr>

          <tr v-if="!items.length">
            <td :colspan="columns.length" class="px-4 py-10">
              <slot name="empty" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const columns = [
  { key: 'orderNumber', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'items', label: 'Items' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Order status' },
  { key: 'paymentStatus', label: 'Payment' },
  { key: 'actions', label: '' },
]

function formatDate(value) {
  if (!value) return '—'
  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatMoney(value, currency = 'USD') {
  const amount = Number(value || 0)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function firstItemTitle(items = []) {
  if (!Array.isArray(items) || !items.length) return 'No line items yet'
  const first = items[0]
  return first?.title || first?.name || 'Untitled item'
}
</script>
