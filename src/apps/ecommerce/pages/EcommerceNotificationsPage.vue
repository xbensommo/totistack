<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Notifications</p>
      <h1 class="text-3xl font-semibold">Commerce notifications</h1>
      <p class="max-w-3xl opacity-70">
        Notifications are no longer optional polish. They are operational control for catalog, orders, returns, and payment confirmation.
      </p>
    </header>

    <div class="grid gap-4 xl:grid-cols-2">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Integrated events</h2>
        <ul class="mt-3 space-y-2 text-sm opacity-70">
          <li>• product published</li>
          <li>• order placed</li>
          <li>• payment awaiting confirmation</li>
          <li>• return approved</li>
          <li>• order cancelled</li>
        </ul>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Integration rule</h2>
        <p class="mt-2 text-sm opacity-70">
          Use the notifications feature if it exists. Otherwise write to the centralized notifications collection from the root store. Do not hardcode page-only alerts.
        </p>
      </article>
    </div>
  </section>
</template>
