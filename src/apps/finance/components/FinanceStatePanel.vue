<template>
  <section class="rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 text-center shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
    <p class="text-[11px] font-semibold uppercase tracking-[0.28em]" :class="toneClass">{{ eyebrow }}</p>
    <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">{{ title }}</h2>
    <p class="mt-3 text-sm leading-7 text-[var(--color-text-light,#64748B)]">{{ message }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  eyebrow: { type: String, default: 'Finance state' },
  title: { type: String, required: true },
  message: { type: String, required: true },
})

const toneClass = computed(() => {
  if (props.tone === 'error') return 'text-rose-600'
  if (props.tone === 'loading') return 'text-[var(--color-primary,#1860A8)]'
  return 'text-[var(--color-primary,#1860A8)]'
})
</script>
