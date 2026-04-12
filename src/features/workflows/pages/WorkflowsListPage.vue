<template>
  <FeaturePageShell eyebrow="Workflows" title="Automation workflows" description="Create trigger-action flows, monitor recent runs, and keep operational automations visible.">
    <template #actions>
      <RouterLink to="/admin/workflows/new" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Create workflow</RouterLink>
    </template>

    <div v-if="workflows.length" class="grid gap-4 xl:grid-cols-2">
      <article v-for="workflow in workflows" :key="workflow.id" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{{ workflow.status }}</p>
        <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ workflow.name }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ workflow.description }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/admin/workflows/${workflow.id}`" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open</RouterLink>
          <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="run(workflow.id)">Run now</button>
        </div>
      </article>
    </div>
    <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
      No workflows yet.
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import { createWorkflowService } from '../services/workflowService.js'

const workflowService = createWorkflowService()
const workflows = ref([])

onMounted(async () => {
  workflows.value = await workflowService.listWorkflows()
})

async function run(workflowId) {
  await workflowService.executeWorkflow(workflowId, { initiatedBy: 'manual-ui' })
}
</script>
