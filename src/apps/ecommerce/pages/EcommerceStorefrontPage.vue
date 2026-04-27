<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Storefront</p>
      <h1 class="text-3xl font-semibold">Shop</h1>
      <p class="max-w-3xl opacity-70">
        Public storefront entry for Namibia-first commerce flows, supporting both products and services.
      </p>
    </header>

    <div class="grid gap-4 xl:grid-cols-3">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Catalog</h2>
        <p class="mt-2 text-sm opacity-70">Use catalogService.buildProductCard() so product and service cards stay consistent.</p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Checkout</h2>
        <p class="mt-2 text-sm opacity-70">Offer Card, EFT, and DPO Pay. Only force shipping when the cart actually needs it.</p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Recovery</h2>
        <p class="mt-2 text-sm opacity-70">Abandoned carts can trigger notifications or CRM only if the business truly follows up.</p>
      </article>
    </div>
  </section>
</template>
