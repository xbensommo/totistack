<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Submitted</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Payload preview</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="submission in submissions" :key="submission.id">
          <td class="px-4 py-3 text-slate-700">{{ submission.submittedAt || submission.createdAt || '—' }}</td>
          <td class="px-4 py-3">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{{ submission.status || 'new' }}</span>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ preview(submission.payload) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * @file forms/components/SubmissionsTable.vue
 * @description Compact starter table for form submissions.
 */
defineProps({
  submissions: { type: Array, default: () => [] },
})

function preview(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'No payload'
  }
  return Object.entries(payload)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ')
}
</script>
