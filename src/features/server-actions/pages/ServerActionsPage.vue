<template>
  <section class="stack gap-4">
    <header>
      <p class="section-label">Framework</p>
      <h1 class="display-section">Server Actions</h1>
      <p class="text-muted">Trusted developer-declared operations. Ordinary CRUD must stay on shard-provider actions.</p>
    </header>

    <div class="card p-4">
      <h2 class="text-lg font-semibold">Rule</h2>
      <p>Use server-actions only for protected, audited, idempotent, external, or cross-collection work.</p>
    </div>
  </section>
</template>
