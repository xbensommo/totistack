<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Finance</p>
      <h1 class="text-3xl font-semibold">Payment reconciliation</h1>
      <p class="max-w-3xl opacity-70">
        This page exists because “paid” is not enough. Finance needs a clear audit trail from payment transaction, to proof review, to posted finance entry, to reconciliation record.
      </p>
    </header>

    <div class="grid gap-4 xl:grid-cols-3">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Queue</h2>
        <p class="mt-2 text-sm opacity-70">
          Start from <code>paymentTransactions</code> in <code>awaiting_confirmation</code> or <code>proof_submitted</code>.
        </p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Review</h2>
        <p class="mt-2 text-sm opacity-70">
          Proof review should update both the proof record and the payment transaction. Rejecting proof must not silently leave the order as paid.
        </p>
      </article>
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Post to finance</h2>
        <p class="mt-2 text-sm opacity-70">
          Approved payments create reconciliation audit records and can optionally post into the finance app through root-store collection actions.
        </p>
      </article>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Recommended columns</h2>
        <ul class="mt-3 space-y-2 text-sm opacity-70">
          <li>• order number</li>
          <li>• payment method</li>
          <li>• amount and currency</li>
          <li>• proof review status</li>
          <li>• finance target collection</li>
          <li>• finance reference</li>
        </ul>
      </article>

      <article class="rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Service rule</h2>
        <p class="mt-2 text-sm opacity-70">
          Keep reconciliation logic inside <code>payment.service.js</code> and <code>finance-sync.service.js</code>. The page should only orchestrate user actions and table state.
        </p>
      </article>
    </div>
  </section>
</template>
