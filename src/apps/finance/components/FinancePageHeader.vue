<template>
  <header class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-8">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl space-y-3">
        <p class="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-primary,#1860A8)]">
          {{ eyebrow }}
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-[var(--color-text,#0F172A)] md:text-4xl">
          {{ title }}
        </h1>
        <p class="max-w-2xl text-sm leading-7 text-[var(--color-text-light,#64748B)] md:text-base">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinancePageHeader.vue
 * @description Shared finance page header.
 */

defineProps({
  eyebrow: {
    type: String,
    default: 'Totistack Finance',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
