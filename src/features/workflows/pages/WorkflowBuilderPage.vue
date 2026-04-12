<template>
  <FeaturePageShell eyebrow="Workflows" :title="pageTitle" description="Use this starter builder to define core trigger metadata and action pipelines.">
    <template #actions>
      <button type="button" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" @click="save">Save workflow</button>
    </template>

    <div class="grid gap-6 xl:grid-cols-[1fr,320px]">
      <WorkflowBuilder :model="workflow" />
      <TriggerCard :trigger="workflow.trigger" />
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import WorkflowBuilder from '../components/WorkflowBuilder.vue'
import TriggerCard from '../components/TriggerCard.vue'
import { createWorkflowService } from '../services/workflowService.js'

const route = useRoute()
const router = useRouter()
const workflowService = createWorkflowService()
const workflow = reactive({ name: '', slug: '', description: '', status: 'draft', trigger: { type: 'manual', event: 'manual.run', config: {} }, actions: [{ type: 'log', message: 'Starter workflow step executed.' }], conditions: [] })
const pageTitle = computed(() => route.params.workflowId ? 'Edit workflow' : 'Create workflow')

onMounted(async () => {
  if (!route.params.workflowId) return
  const loaded = await workflowService.getWorkflowById(route.params.workflowId)
  if (loaded) {
    Object.assign(workflow, loaded)
  }
})

async function save() {
  const saved = await workflowService.saveWorkflow({ ...workflow, id: route.params.workflowId || undefined })
  router.push(`/admin/workflows/${saved.id}`)
}
</script>
