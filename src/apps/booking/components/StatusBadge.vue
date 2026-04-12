<template>
  <span :class="badgeClass" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'pending',
  },
})

const map = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  checked_in: 'bg-sky-100 text-sky-800',
  completed: 'bg-slate-200 text-slate-800',
  cancelled: 'bg-rose-100 text-rose-800',
  no_show: 'bg-red-100 text-red-800',
}

const label = computed(() => props.status.replace(/_/g, ' '))
const badgeClass = computed(() => map[props.status] || 'bg-slate-100 text-slate-700')
</script>
