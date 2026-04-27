<template>
  <article class="rounded-[24px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-light,#64748B)]">
          {{ label }}
        </p>
        <p class="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
          {{ value }}
        </p>
      </div>

      <span
        class="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
        :class="toneClass"
      >
        {{ badge }}
      </span>
    </div>

    <p v-if="hint" class="mt-4 text-sm text-[var(--color-text-light,#64748B)]">
      {{ hint }}
    </p>
  </article>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceKpiCard.vue
 * @description Finance KPI card.
 */

import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  badge: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'neutral',
  },
})

const toneClass = computed(() => {
  if (props.tone === 'positive') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (props.tone === 'attention') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-[var(--color-neutral,#F8FAFC)] text-[var(--color-text-light,#64748B)]'
})
</script>
