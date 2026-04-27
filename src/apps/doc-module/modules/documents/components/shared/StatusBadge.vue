<template>
  <span
    class="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'draft',
  },
});

const label = computed(() => String(props.status || 'draft').replaceAll('_', ' '));

const badgeClass = computed(() => {
  switch (props.status) {
    case 'signed':
    case 'active':
    case 'paid':
    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'approved':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'cancelled':
    case 'void':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'sent':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
});
</script>
