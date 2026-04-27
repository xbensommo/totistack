<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Payments</p>
      <h1 class="text-3xl font-semibold">Namibia-first payments</h1>
      <p class="max-w-3xl opacity-70">
        Keep checkout practical: card, EFT, and DPO Pay first. Do not design around gateways the business will not actually use.
      </p>
    </header>

    <div class="grid gap-4 xl:grid-cols-3">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Card</h2>
        <p class="mt-2 text-sm opacity-70">Fast checkout for supported gateways. Keep payment status pending until the callback or confirmation lands.</p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">EFT</h2>
        <p class="mt-2 text-sm opacity-70">Manual verification flow. Finance should receive a notification before the order is treated as paid.</p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">DPO Pay</h2>
        <p class="mt-2 text-sm opacity-70">Regional gateway option for southern African commerce operations where it fits the business.</p>
      </article>
    </div>

    <div class="rounded-3xl border p-6 opacity-80">
      Payment transactions now have their own collection so finance and support can audit method, status, reference, and instructions without polluting the order document.
    </div>
  </section>
</template>
