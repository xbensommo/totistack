<template>
  <EntityPageShell
    eyebrow="Commerce operations"
    title="Orders"
    description="Track incoming orders, payment health, and fulfillment progress from one clean workspace."
  >
    <template #actions>
      <RouterLink
        to="/cart"
        class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Open cart
      </RouterLink>
      <RouterLink
        to="/checkout"
        class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        New order
      </RouterLink>
    </template>

    <template #metrics>
      <StatCard label="Orders" :value="metrics.total" hint="Visible records in the current store snapshot." icon="🧾" />
      <StatCard label="Revenue" :value="formatMoney(metrics.revenue)" hint="Combined total of visible orders." icon="💰" />
      <StatCard label="Pending" :value="metrics.pending" hint="Require payment, review, or fulfillment." icon="⏳" />
      <StatCard label="Delivered" :value="metrics.delivered" hint="Successfully completed fulfillment." icon="📦" />
    </template>

    <div class="space-y-5">
      <OrderFilters v-model="filters" />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">
          {{ loading ? 'Loading orders...' : `Showing ${filteredItems.length} orders` }}
        </p>

        <button
          type="button"
          class="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="reload"
        >
          Refresh
        </button>
      </div>

      <OrdersTable :items="filteredItems">
        <template #actions="{ item }">
          <div class="flex justify-end gap-2">
            <RouterLink
              :to="`/orders/${item.id}`"
              class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View
            </RouterLink>
            <RouterLink
              :to="`/orders/${item.id}/invoice`"
              class="inline-flex items-center rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              Invoice
            </RouterLink>
          </div>
        </template>

        <template #empty>
          <EmptyState
            title="No orders found"
            description="Once payments or checkouts start flowing through the business, the order desk will populate here."
            icon="🛒"
          >
            <template #actions>
              <RouterLink
                to="/checkout"
                class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Create first order
              </RouterLink>
            </template>
          </EmptyState>
        </template>
      </OrdersTable>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import { createOrderServices } from '../services/orderService.js'
import EntityPageShell from '../components/EntityPageShell.vue'
import StatCard from '../components/StatCard.vue'
import OrderFilters from '../components/OrderFilters.vue'
import OrdersTable from '../components/OrdersTable.vue'
import EmptyState from '../components/EmptyState.vue'

const store = useAppStore()
const orderService = createOrderServices({ store })

const filters = ref({
  search: '',
  status: '',
  paymentStatus: '',
  startDate: '',
  endDate: '',
})

const loading = computed(() => Boolean(store.loading?.value || store.loading || false))
const sourceItems = computed(() => {
  const rootState = store.orders?.items || store.orders?.value?.items || store.orders?.value || store.orders || []
  return Array.isArray(rootState) ? rootState : []
})

const filteredItems = computed(() => {
  return sourceItems.value.filter((item) => {
    const haystack = [
      item.orderNumber,
      item.shippingAddress?.firstName,
      item.shippingAddress?.lastName,
      item.shippingAddress?.email,
      item.clientId,
      item.notes,
      item.customerNotes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const searchOk = !filters.value.search || haystack.includes(filters.value.search.toLowerCase())
    const statusOk = !filters.value.status || item.status === filters.value.status
    const paymentOk = !filters.value.paymentStatus || item.paymentStatus === filters.value.paymentStatus

    const createdAt = normalizeDate(item.createdAt)
    const afterStart = !filters.value.startDate || (createdAt && createdAt >= new Date(filters.value.startDate))
    const beforeEnd = !filters.value.endDate || (createdAt && createdAt <= new Date(`${filters.value.endDate}T23:59:59`))

    return searchOk && statusOk && paymentOk && afterStart && beforeEnd
  })
})

const metrics = computed(() => {
  const items = filteredItems.value
  return {
    total: items.length,
    revenue: items.reduce((sum, item) => sum + Number(item.total || 0), 0),
    pending: items.filter((item) => ['pending', 'processing'].includes(item.status)).length,
    delivered: items.filter((item) => item.status === 'delivered').length,
  }
})

onMounted(() => {
  reload()
})

async function reload() {
  try {
    await orderService.list({
      orderBy: 'createdAt',
      orderDirection: 'desc',
      limit: 30,
    })
  } catch (error) {
    console.error('[OrdersListPage] Failed to load orders.', error)
  }
}

function normalizeDate(value) {
  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}
</script>
