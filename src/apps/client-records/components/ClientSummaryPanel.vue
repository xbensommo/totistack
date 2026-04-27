<template>
  <aside class="card sticky top-24 overflow-hidden">
    <div class="absolute inset-x-6 top-0 h-px bg-brand-gradient opacity-70"></div>

    <div class="space-y-3">
      <p class="section-label">
        Client Summary
      </p>
      <div class="space-y-1">
        <h2 class="section-title">
          {{ headline }}
        </h2>
        <p class="text-sm text-muted">
          {{ client.clientNumber || 'No client number' }}
        </p>
      </div>
    </div>

    <dl class="mt-6 space-y-4 text-sm">
      <div class="status-strip">
        <dt class="text-muted">Status</dt>
        <dd><span class="badge badge-primary">{{ client.status || '—' }}</span></dd>
      </div>
      <div class="status-strip">
        <dt class="text-muted">Lifecycle</dt>
        <dd class="font-medium text-[var(--color-text)]">{{ client.lifecycleStage || '—' }}</dd>
      </div>
      <div class="status-strip">
        <dt class="text-muted">Email</dt>
        <dd class="font-medium text-[var(--color-text)] text-right break-all">{{ client.email || '—' }}</dd>
      </div>
      <div class="status-strip">
        <dt class="text-muted">Phone</dt>
        <dd class="font-medium text-[var(--color-text)]">{{ client.phone || '—' }}</dd>
      </div>
      <div class="status-strip">
        <dt class="text-muted">Assigned To</dt>
        <dd class="font-medium text-[var(--color-text)]">{{ client.assignedTo || 'Unassigned' }}</dd>
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
