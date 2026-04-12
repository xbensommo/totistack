<template>
  <FeaturePageShell eyebrow="Workflows" title="Workflow runs" description="Review recent workflow executions and quickly spot failures or stuck runs.">
    <ExecutionRunsTable v-if="runs.length" :runs="runs" />
    <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
      No workflow runs yet.
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import ExecutionRunsTable from '../components/ExecutionRunsTable.vue'
import { createWorkflowService } from '../services/workflowService.js'

const workflowService = createWorkflowService()
const runs = ref([])

onMounted(async () => {
  runs.value = await workflowService.listRuns()
})
</script>
