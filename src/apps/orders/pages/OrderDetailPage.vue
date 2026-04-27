<template>
  <EntityPageShell
    eyebrow="Order desk"
    :title="order?.orderNumber || 'Order details'"
    description="Review customer information, order line items, payment state, and fulfillment progress."
  >
    <template #actions>
      <RouterLink
        to="/orders"
        class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Back to orders
      </RouterLink>
      <RouterLink
        v-if="order?.id"
        :to="`/orders/${order.id}/invoice`"
        class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        View invoice
      </RouterLink>
    </template>

    <div v-if="loading && !order" class="py-16 text-center text-sm text-slate-500">
      Loading order details...
    </div>

    <div v-else-if="!order" class="py-4">
      <EmptyState
        title="Order not found"
        description="The requested order could not be loaded from the current store or collection actions."
        icon="🔎"
      >
        <template #actions>
          <RouterLink
            to="/orders"
            class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Return to orders
          </RouterLink>
        </template>
      </EmptyState>
    </div>

    <div v-else class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
      <div class="space-y-6">
        <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer</p>
              <h2 class="mt-2 text-xl font-semibold text-slate-950">
                {{ order.shippingAddress?.firstName || 'Customer' }} {{ order.shippingAddress?.lastName || '' }}
              </h2>
              <p class="mt-1 text-sm text-slate-500">{{ order.shippingAddress?.email || order.clientId || 'No email provided' }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <StatusBadge :status="order.status || 'pending'" />
              <StatusBadge :status="order.paymentStatus || 'pending'" variant="payment" />
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping address</p>
              <p class="mt-3 text-sm leading-6 text-slate-700">
                {{ formatAddress(order.shippingAddress) }}
              </p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes</p>
              <p class="mt-3 text-sm leading-6 text-slate-700">
                {{ order.customerNotes || order.notes || 'No notes captured for this order.' }}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Line items</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-950">What the customer ordered</h3>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <article
              v-for="(item, index) in order.items || []"
              :key="item.productId || item.sku || index"
              class="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div class="min-w-0">
                <p class="font-medium text-slate-950">{{ item.title || 'Untitled item' }}</p>
                <p class="mt-1 text-sm text-slate-500">SKU: {{ item.sku || '—' }}</p>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm md:min-w-[260px]">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Qty</p>
                  <p class="mt-1 font-medium text-slate-900">{{ item.quantity || 1 }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
                  <p class="mt-1 font-medium text-slate-900">{{ formatMoney(item.price, order.currency) }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Subtotal</p>
                  <p class="mt-1 font-medium text-slate-900">{{ formatMoney(item.subtotal, order.currency) }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <OrderSummaryCard :order="order" />
        <OrderTimeline :order="order" />
      </div>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import { createOrderServices } from '../services/orderService.js'
import EntityPageShell from '../components/EntityPageShell.vue'
import EmptyState from '../components/EmptyState.vue'
import StatusBadge from '../components/StatusBadge.vue'
import OrderSummaryCard from '../components/OrderSummaryCard.vue'
import OrderTimeline from '../components/OrderTimeline.vue'

const route = useRoute()
const store = useAppStore()
const orderService = createOrderServices({ store })
const order = ref(null)
const loading = computed(() => Boolean(store.loading?.value || store.loading || false))

onMounted(() => {
  loadOrder()
})

async function loadOrder() {
  try {
    order.value = await orderService.getById(route.params.id)
  } catch (error) {
    console.error('[OrderDetailPage] Failed to load order.', error)
    order.value = null
  }
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatAddress(address) {
  if (!address) return 'No shipping address captured yet.'

  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.address1,
    address.address2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .join(', ')
}
</script>
