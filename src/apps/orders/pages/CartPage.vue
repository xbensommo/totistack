<template>
  <EntityPageShell
    eyebrow="Commerce operations"
    title="Cart"
    description="Use this starter cart page for internal order capture, quick drafts, or customer-assisted checkout flows."
  >
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
      <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Draft basket</p>
            <h2 class="mt-1 text-lg font-semibold text-slate-950">Selected items</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {{ cartItems.length }} items
          </span>
        </div>

        <div v-if="cartItems.length" class="mt-5 space-y-3">
          <article
            v-for="item in cartItems"
            :key="item.id"
            class="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div class="min-w-0">
              <p class="font-medium text-slate-950">{{ item.title }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ item.description }}</p>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm md:min-w-[240px]">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Qty</p>
                <p class="mt-1 font-medium text-slate-900">{{ item.quantity }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
                <p class="mt-1 font-medium text-slate-900">{{ formatMoney(item.price) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Subtotal</p>
                <p class="mt-1 font-medium text-slate-900">{{ formatMoney(item.quantity * item.price) }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="mt-5">
          <EmptyState
            title="Cart is empty"
            description="Wire this screen to product selection, quotations, or assisted order-entry flows."
            icon="🛍️"
          />
        </div>
      </section>

      <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Summary</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-950">Ready for checkout</h2>

        <dl class="mt-5 space-y-3 text-sm">
          <div class="flex items-center justify-between gap-3 text-slate-600">
            <dt>Subtotal</dt>
            <dd class="font-medium text-slate-900">{{ formatMoney(subtotal) }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 text-slate-600">
            <dt>Estimated tax</dt>
            <dd class="font-medium text-slate-900">{{ formatMoney(tax) }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 text-slate-600">
            <dt>Shipping</dt>
            <dd class="font-medium text-slate-900">{{ formatMoney(shipping) }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base text-slate-950">
            <dt class="font-semibold">Estimated total</dt>
            <dd class="font-semibold">{{ formatMoney(total) }}</dd>
          </div>
        </dl>

        <RouterLink
          to="/checkout"
          class="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Continue to checkout
        </RouterLink>
      </section>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EntityPageShell from '../components/EntityPageShell.vue'
import EmptyState from '../components/EmptyState.vue'

const cartItems = ref([
  {
    id: 'draft-1',
    title: 'Premium support retainer',
    description: 'Starter placeholder item for extending the cart flow.',
    quantity: 1,
    price: 180,
  },
  {
    id: 'draft-2',
    title: 'Implementation workshop',
    description: 'Example line item to show layout behavior.',
    quantity: 2,
    price: 75,
  },
])

const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))
const tax = computed(() => Number((subtotal.value * 0.15).toFixed(2)))
const shipping = computed(() => 0)
const total = computed(() => subtotal.value + tax.value + shipping.value)

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}
</script>
