<template>
  <span :class="classes" class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset">
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
    {{ normalizedLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'pending',
  },
  variant: {
    type: String,
    default: 'order',
  },
})

const normalizedStatus = computed(() => String(props.status || 'pending').toLowerCase())
const normalizedLabel = computed(() => normalizedStatus.value.replace(/[_-]+/g, ' '))

const palettes = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  delivered: 'bg-teal-50 text-teal-700 ring-teal-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  refunded: 'bg-slate-100 text-slate-700 ring-slate-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
  partial: 'bg-violet-50 text-violet-700 ring-violet-200',
}

const classes = computed(() => palettes[normalizedStatus.value] || 'bg-slate-100 text-slate-700 ring-slate-200')
</script>
