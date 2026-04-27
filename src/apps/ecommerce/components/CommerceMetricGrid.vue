<template>
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <article v-for="metric in metrics" :key="metric.label" class="border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f8fafc)] p-4">
      <p class="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted,#64748b)]">{{ metric.label }}</p>
      <p class="mt-2 text-2xl font-semibold">{{ metric.value }}</p>
      <p v-if="metric.hint" class="mt-1 text-xs text-[var(--color-text-muted,#64748b)]">{{ metric.hint }}</p>
    </article>
  </div>
</template>

<script setup>
defineProps({ metrics: { type: Array, default: () => [] } })
</script>
