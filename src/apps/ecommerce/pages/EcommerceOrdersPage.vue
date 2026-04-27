<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Operations</p>
      <h1 class="text-3xl font-semibold">Orders</h1>
      <p class="max-w-3xl opacity-70">
        Process orders, fulfillment, payment state, cancellations, returns, and support escalations.
      </p>
    </header>

    <OrderStatsCards />

    <div class="grid gap-4 xl:grid-cols-3">
      <article class="rounded-3xl border p-6 opacity-80">
        <h2 class="text-lg font-semibold">Physical orders</h2>
        <p class="mt-2 text-sm opacity-70">Require shipping address, stock control, packing, and delivery state.</p>
      </article>
      <article class="rounded-3xl border p-6 opacity-80">
        <h2 class="text-lg font-semibold">Service orders</h2>
        <p class="mt-2 text-sm opacity-70">Do not force shipping. Use service duration or schedule metadata instead of fake stock flows.</p>
      </article>
      <article class="rounded-3xl border p-6 opacity-80">
        <h2 class="text-lg font-semibold">Payment control</h2>
        <p class="mt-2 text-sm opacity-70">EFT orders should stay unfulfilled until proof is confirmed. Card and DPO Pay can continue through gateway verification.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import OrderStatsCards from '../components/orders/OrderStatsCards.vue'
</script>
