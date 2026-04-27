<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
    :class="classes"
  >
    {{ label }}
  </span>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceStatusBadge.vue
 * @description Small reusable status badge.
 */

import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const label = computed(() => String(props.status || 'unknown').replace(/_/g, ' '))

const classes = computed(() => {
  switch (props.status) {
    case 'posted':
    case 'closed':
      return 'bg-emerald-50 text-emerald-700'
    case 'reviewed':
      return 'bg-sky-50 text-sky-700'
    case 'draft':
    case 'open':
      return 'bg-amber-50 text-amber-700'
    case 'reversed':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-[var(--color-neutral,#F8FAFC)] text-[var(--color-text-light,#64748B)]'
  }
})
</script>
