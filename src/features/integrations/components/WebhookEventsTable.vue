<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Level</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Event</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Message</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Created</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="log in items" :key="log.id">
          <td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{{ log.level }}</span></td>
          <td class="px-4 py-3 font-medium text-slate-800">{{ log.event }}</td>
          <td class="px-4 py-3 text-slate-600">{{ log.message }}</td>
          <td class="px-4 py-3 text-slate-500">{{ log.createdAt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * @file integrations/components/WebhookEventsTable.vue
 * @description Generic event log table for integration diagnostics.
 */
defineProps({
  items: { type: Array, default: () => [] },
})
</script>
