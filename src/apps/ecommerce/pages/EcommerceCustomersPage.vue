<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Customers</p>
      <h1 class="text-3xl font-semibold">Customers</h1>
      <p class="max-w-3xl opacity-70">
        Centralize customer records, order history, preferred payment habits, and support visibility without duplicating auth profile data.
      </p>
    </header>

    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">What belongs here</h2>
        <p class="mt-2 text-sm opacity-70">
          Commerce relationship data, marketing consent, lifetime value, order count, and preferred payment method.
        </p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">What does not belong here</h2>
        <p class="mt-2 text-sm opacity-70">
          Do not merge customer history with auth internals or mutable order snapshots. Orders must remain historical truth.
        </p>
      </article>
    </div>
  </section>
</template>
