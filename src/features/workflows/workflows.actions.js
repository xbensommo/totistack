/** @file src/features/workflows/workflows.actions.js */

function getWorkflowService(context) {
  const service = context?.service || context?.services?.workflows || context?.services?.workflowService
  if (!service) throw new Error('Workflow service is not configured for this action.')
  return service
}

export function createWorkflowActionDefinitions() {
  return [
    {
      type: 'workflows.workflow.save',
      confirm: ({ target, payload }) => ({
        title: 'Save workflow',
        message: `Save ${target?.name || payload?.name || 'this workflow'}?`,
        confirmText: 'Save workflow',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getWorkflowService(context).saveWorkflow({ ...(context.payload || {}), id: context.target?.id || context.id || context.payload?.id }),
    },
    {
      type: 'workflows.workflow.execute',
      confirm: ({ target }) => ({
        title: 'Run workflow',
        message: `Run ${target?.name || 'this workflow'} now?`,
        confirmText: 'Run workflow',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getWorkflowService(context).executeWorkflow(context.target?.id || context.id || context.workflowId, context.payload || {}),
    },
  ]
}

export default createWorkflowActionDefinitions
