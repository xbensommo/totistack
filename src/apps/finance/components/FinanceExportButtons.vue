<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text,#0F172A)] transition hover:bg-[var(--color-neutral,#F8FAFC)] disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled"
      @click="$emit('csv')"
    >
      Export CSV
    </button>
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent,#000000)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled"
      @click="$emit('pdf')"
    >
      Print / PDF
    </button>
  </div>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceExportButtons.vue
 * @description Shared finance export action buttons.
 */

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['csv', 'pdf'])
</script>
