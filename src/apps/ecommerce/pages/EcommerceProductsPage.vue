<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Catalog</p>
      <h1 class="text-3xl font-semibold">Products and services</h1>
      <p class="max-w-3xl opacity-70">
        Manage physical products, service offerings, variants, pricing, publishing state, and storefront visibility from one catalog.
      </p>
    </header>

    <ProductListToolbar />

    <div class="grid gap-4 xl:grid-cols-2">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Physical product basics</h2>
        <ul class="mt-3 space-y-2 text-sm opacity-70">
          <li>• name, slug, categories, media, SKU root</li>
          <li>• variants with price, compare-at price, stock, threshold</li>
          <li>• shipping profile, tax profile, visibility</li>
        </ul>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Service basics</h2>
        <ul class="mt-3 space-y-2 text-sm opacity-70">
          <li>• type = service and fulfillmentType = service</li>
          <li>• non-stock-tracked variants with price and duration</li>
          <li>• optional serviceConfig for booking, delivery mode, lead time</li>
        </ul>
      </article>
    </div>

    <div class="rounded-3xl border p-6 opacity-80">
      Product publication now supports notification integration so catalog managers are alerted when listings go live.
    </div>
  </section>
</template>

<script setup>
import ProductListToolbar from '../components/products/ProductListToolbar.vue'
</script>
