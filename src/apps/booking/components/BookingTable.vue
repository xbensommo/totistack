<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-200 bg-white">
          <tr
            v-for="item in items"
            :key="item.id || item.bookingNumber"
            class="transition hover:bg-slate-50"
          >
            <td class="px-4 py-3 text-sm font-medium text-slate-900">
              {{ item.bookingNumber || '—' }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700">
              <div class="font-medium text-slate-900">{{ item.title || 'Untitled booking' }}</div>
              <div class="text-xs text-slate-500">{{ item.customerName || item.customerEmail || 'Unknown customer' }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-700">
              {{ formatDate(item.startTime) }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700">
              {{ item.resourceType || '—' }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700">
              {{ formatMoney(item.amount, item.currency) }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700">
              <StatusBadge :status="item.status || 'pending'" />
            </td>
            <td class="px-4 py-3 text-right text-sm text-slate-700">
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
  { key: 'bookingNumber', label: 'Booking' },
  { key: 'title', label: 'Details' },
  { key: 'startTime', label: 'Start' },
  { key: 'resourceType', label: 'Resource' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
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
</script>
