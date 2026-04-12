/**
 * @file workflows/stores/workflowStore.js
 * @description Lightweight UI-only Pinia store retained for backward compatibility.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkflowUiStore = defineStore('workflow-ui', () => {
  const selectedWorkflowId = ref(null)
  const selectedRunId = ref(null)

  function selectWorkflow(workflowId) {
    selectedWorkflowId.value = workflowId
  }

  function selectRun(runId) {
    selectedRunId.value = runId
  }

  return {
    selectedWorkflowId,
    selectedRunId,
    selectWorkflow,
    selectRun,
  }
})
