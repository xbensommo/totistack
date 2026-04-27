<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Commerce</p>
      <h1 class="text-3xl font-semibold">Ecommerce dashboard</h1>
      <p class="max-w-3xl opacity-70">
        Revenue, orders, catalog mix, payment pressure, inventory risk, and operational alerts in one place.
      </p>
    </header>

    <OrderStatsCards />

    <div class="grid gap-4 xl:grid-cols-3">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Catalog mix</h2>
        <p class="mt-2 text-sm opacity-70">
          Keep physical products and services in one catalog, but report them separately. Shipping logic and fulfillment should not leak into service orders.
        </p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Namibia-first payments</h2>
        <p class="mt-2 text-sm opacity-70">
          Card, EFT, and DPO Pay are treated as first-class payment methods. EFT should trigger manual verification notifications before fulfillment.
        </p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Actionable notifications</h2>
        <p class="mt-2 text-sm opacity-70">
          Order placed, payment awaiting confirmation, product published, and returns approved now route into notification workflows instead of getting buried in logs.
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
import OrderStatsCards from '../components/orders/OrderStatsCards.vue'
</script>
