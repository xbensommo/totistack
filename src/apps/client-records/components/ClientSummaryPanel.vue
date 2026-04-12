<template>
  <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Client Summary
      </p>
      <h2 class="text-xl font-semibold text-slate-900">
        {{ headline }}
      </h2>
      <p class="text-sm text-slate-600">
        {{ client.clientNumber || 'No client number' }}
      </p>
    </div>

    <dl class="mt-6 space-y-4 text-sm">
      <div class="flex items-start justify-between gap-3">
        <dt class="text-slate-500">Status</dt>
        <dd class="font-medium text-slate-900">{{ client.status || '—' }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="text-slate-500">Lifecycle</dt>
        <dd class="font-medium text-slate-900">{{ client.lifecycleStage || '—' }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="text-slate-500">Email</dt>
        <dd class="font-medium text-slate-900">{{ client.email || '—' }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="text-slate-500">Phone</dt>
        <dd class="font-medium text-slate-900">{{ client.phone || '—' }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="text-slate-500">Assigned To</dt>
        <dd class="font-medium text-slate-900">{{ client.assignedTo || 'Unassigned' }}</dd>
      </div>
    </dl>
  </aside>
</template>

<script setup>
/**
 * @file ClientSummaryPanel.vue
 * @description Small domain component built on top of generic records UI.
 */

import { computed } from 'vue'

const props = defineProps({
  client: {
    type: Object,
    default: () => ({}),
  },
})

const headline = computed(() => {
  if (props.client.companyName) return props.client.companyName
  return [props.client.firstName, props.client.lastName].filter(Boolean).join(' ') || 'Unnamed client'
})
</script>
