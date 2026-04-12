/**
 * @file workflows/services/workflowService.js
 * @description Root-store compatible service factory for the workflows feature.
 */
import { useAppStore } from '@/stores/appStore'
import {
  assertAccess,
  createId,
  createLegacyService,
  fetchCollectionItems,
  getCollectionActions,
  normalizeError,
  runAction,
  slugify,
} from '../../shared/featureToolkit.js'

/**
 * Create the workflows feature service.
 *
 * @param {object} context
 * @returns {object}
 */
export function createWorkflowService({ appStore, access, services = {}, config = {} } = {}) {
  const store = appStore || useAppStore()
  const featureAccess = access || store?.access || null
  const workflowActions = getCollectionActions(store, 'workflows')
  const runActions = getCollectionActions(store, 'workflowRuns')
  const triggerActions = getCollectionActions(store, 'workflowTriggers')
  const logActions = getCollectionActions(store, 'workflowLogs')
  const settings = { defaultRetryPolicy: { maxRetries: 3, retryDelayMs: 5000 }, ...config }

  async function listWorkflows(options = {}) {
    return fetchCollectionItems(store, 'workflows', options)
  }

  async function getWorkflowById(workflowId) {
    try {
      return await runAction(workflowActions, ['getById'], workflowId)
    } catch (error) {
      throw normalizeError(error, 'Unable to load the selected workflow.')
    }
  }

  async function saveWorkflow(payload) {
    try {
      assertAccess(featureAccess, 'workflows.manage', 'You are not allowed to manage workflows.')
      const workflowId = payload.id || createId('workflow')
      const record = {
        name: payload.name?.trim() || 'Untitled workflow',
        slug: payload.slug?.trim() || slugify(payload.name || 'untitled-workflow'),
        description: payload.description || '',
        status: payload.status || 'draft',
        trigger: payload.trigger || { type: 'manual', event: 'manual.run', config: {} },
        actions: Array.isArray(payload.actions) ? payload.actions : [],
        conditions: Array.isArray(payload.conditions) ? payload.conditions : [],
        retryPolicy: payload.retryPolicy || settings.defaultRetryPolicy,
        lastRunAt: payload.lastRunAt || null,
        updatedAt: new Date().toISOString(),
      }
      if (payload.id) {
        await runAction(workflowActions, ['update'], workflowId, record)
      } else {
        await runAction(workflowActions, ['setById', 'create', 'add'], workflowId, { ...record, createdAt: record.updatedAt })
      }
      await saveTrigger(workflowId, record.trigger)
      return { id: workflowId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the workflow.')
    }
  }

  async function saveTrigger(workflowId, trigger) {
    const triggerId = createId('workflow-trigger')
    const record = {
      workflowId,
      type: trigger.type || 'manual',
      event: trigger.event || 'manual.run',
      isActive: trigger.isActive !== false,
      config: trigger.config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await runAction(triggerActions, ['setById', 'create', 'add'], triggerId, record)
    return { id: triggerId, ...record }
  }

  async function executeWorkflow(workflowId, payload = {}) {
    try {
      assertAccess(featureAccess, 'workflows.run', 'You are not allowed to execute workflows.')
      const workflow = await getWorkflowById(workflowId)
      if (!workflow) {
        throw new Error('Workflow not found.')
      }
      const runId = createId('workflow-run')
      const startedAt = new Date().toISOString()
      await runAction(runActions, ['setById', 'create', 'add'], runId, {
        workflowId,
        workflowName: workflow.name,
        status: 'running',
        triggerType: workflow.trigger?.type || 'manual',
        payload,
        output: {},
        startedAt,
        finishedAt: null,
        createdAt: startedAt,
      })

      const output = await executeActions(workflow.actions, payload, services)
      const finishedAt = new Date().toISOString()
      await runAction(runActions, ['update'], runId, {
        status: 'completed',
        output,
        finishedAt,
      })
      await runAction(workflowActions, ['update'], workflowId, { lastRunAt: finishedAt, updatedAt: finishedAt })
      await log(workflowId, { workflowRunId: runId, level: 'info', message: `Workflow ${workflow.name} completed successfully.`, context: { output } })
      return { id: runId, workflowId, output, finishedAt }
    } catch (error) {
      const normalized = normalizeError(error, 'Unable to execute the workflow.')
      await log(workflowId, { level: 'error', message: normalized.message })
      throw normalized
    }
  }

  async function listRuns(options = {}) {
    return fetchCollectionItems(store, 'workflowRuns', options)
  }

  async function log(workflowId, payload) {
    const logId = createId('workflow-log')
    const record = {
      workflowId,
      workflowRunId: payload.workflowRunId || '',
      level: payload.level || 'info',
      message: payload.message || 'Workflow event recorded.',
      context: payload.context || {},
      createdAt: new Date().toISOString(),
    }
    await runAction(logActions, ['setById', 'create', 'add'], logId, record)
    return { id: logId, ...record }
  }

  async function handleFormSubmission({ form, submission }) {
    const workflows = await listWorkflows()
    const candidates = workflows.filter((item) => item.status === 'active' && item.trigger?.event === 'forms.submitted')
    const runs = []
    for (const workflow of candidates) {
      runs.push(await executeWorkflow(workflow.id, { form, submission }))
    }
    return runs
  }

  return {
    settings,
    listWorkflows,
    getWorkflowById,
    saveWorkflow,
    executeWorkflow,
    listRuns,
    log,
    handleFormSubmission,
  }
}

async function executeActions(actions = [], payload = {}, services = {}) {
  const output = { steps: [] }
  for (const action of actions) {
    if (action.type === 'log') {
      output.steps.push({ type: 'log', message: action.message || 'Workflow log action executed.' })
      continue
    }
    if (action.type === 'integration.test' && services.integrationsService?.testConnection) {
      const result = await services.integrationsService.testConnection(action.integrationId)
      output.steps.push({ type: action.type, result })
      continue
    }
    output.steps.push({ type: action.type || 'noop', payload })
  }
  return output
}

const legacyService = createLegacyService(() => createWorkflowService({ appStore: useAppStore() }))
export default legacyService
