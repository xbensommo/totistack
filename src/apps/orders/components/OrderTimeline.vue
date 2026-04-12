<template>
  <div class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Activity</p>
        <h3 class="mt-1 text-lg font-semibold text-slate-950">Order timeline</h3>
      </div>
    </div>

    <ol class="mt-5 space-y-4">
      <li v-for="event in events" :key="event.key" class="flex gap-3">
        <div class="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
          {{ event.badge }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-slate-900">{{ event.title }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ event.description }}</p>
          <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{{ event.time }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    default: () => null,
  },
})

const events = computed(() => {
  const order = props.order || {}
  return [
    {
      key: 'created',
      badge: '1',
      title: 'Order created',
      description: 'The order entered the system and is ready for review.',
      time: formatDate(order.createdAt),
    },
    {
      key: 'processed',
      badge: '2',
      title: 'Processing started',
      description: 'Operations accepted the order and began fulfillment.',
      time: formatDate(order.processedAt),
    },
    {
      key: 'shipment',
      badge: '3',
      title: 'Shipment / delivery',
      description: order.trackingNumber
        ? `Tracking ${order.trackingNumber}${order.carrier ? ` with ${order.carrier}` : ''}.`
        : 'Tracking information has not been attached yet.',
      time: formatDate(order.deliveredAt || order.estimatedDelivery),
    },
  ]
})

function formatDate(value) {
  if (!value) return 'Pending'
  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value)

  if (Number.isNaN(date.getTime())) return 'Pending'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>
