<template>
  <div class="table-wrap">
    <div class="overflow-x-auto">
      <table class="table-base">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in items"
            :key="item.id || item.bookingNumber"
          >
            <td class="min-w-[170px]">
              <div class="font-semibold text-[var(--color-text)]">{{ item.bookingNumber || '—' }}</div>
              <div class="mt-2 inline-flex rounded-full bg-[rgba(109,94,252,0.08)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-primary">
                {{ item.accessCode || 'No code' }}
              </div>
            </td>
            <td class="min-w-[220px]">
              <div class="font-semibold text-[var(--color-text)]">{{ item.title || item.serviceName || 'Untitled booking' }}</div>
              <div class="mt-1 text-xs text-muted">{{ item.customerName || item.customerEmail || 'Unknown customer' }}</div>
            </td>
            <td class="min-w-[220px]">
              <div class="text-[var(--color-text)]">{{ formatDate(item.startTime) }}</div>
              <div class="mt-1 text-xs text-muted">{{ item.locationName || item.resourceType || '—' }}</div>
            </td>
            <td class="min-w-[160px]">
              <div class="capitalize text-[var(--color-text)]">{{ item.bookingChannel || '—' }}</div>
              <div class="mt-1 text-xs text-muted">{{ item.paymentStatus || 'pending' }}</div>
            </td>
            <td class="whitespace-nowrap font-semibold text-[var(--color-text)]">
              {{ formatMoney(item.amount, item.currency) }}
            </td>
            <td>
              <StatusBadge :status="item.status || 'pending'" />
            </td>
            <td class="text-right">
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
  { key: 'bookingNumber', label: 'Reference' },
  { key: 'title', label: 'Booking' },
  { key: 'startTime', label: 'Schedule' },
  { key: 'bookingChannel', label: 'Channel' },
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
