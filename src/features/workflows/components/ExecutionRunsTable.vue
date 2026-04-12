<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Workflow</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Started</th>
          <th class="px-4 py-3 text-left font-semibold text-slate-600">Finished</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="run in runs" :key="run.id">
          <td class="px-4 py-3 font-medium text-slate-800">{{ run.workflowName }}</td>
          <td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{{ run.status }}</span></td>
          <td class="px-4 py-3 text-slate-600">{{ run.startedAt }}</td>
          <td class="px-4 py-3 text-slate-600">{{ run.finishedAt || '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/** @file workflows/components/ExecutionRunsTable.vue */
defineProps({ runs: { type: Array, default: () => [] } })
</script>
