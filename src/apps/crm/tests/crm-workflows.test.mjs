import test from 'node:test'
import assert from 'node:assert/strict'
import { createCrmWorkflowService } from '../services/createCrmWorkflowService.js'

test('assignLead updates lead and dispatches notification', async () => {
  const calls = []
  const crmService = {
    async fetchLeadById(id) { return { id, fullName: 'Test Lead', assignedTo: null } },
    async updateLead(id, patch) { return { id, ...patch, fullName: 'Test Lead' } },
    async convertLeadToOpportunity() { throw new Error('not needed') },
    async createTask() { throw new Error('not needed') },
    async completeTask() { throw new Error('not needed') },
    async fetchTasks() { return [] },
  }

  const workflow = createCrmWorkflowService({
    crmService,
    confirm: async () => true,
    notifications: { async handleEvent(event, payload) { calls.push([event, payload.recipientId]) } },
  })

  const result = await workflow.assignLead('lead_1', 'user_2', { actor: { id: 'admin_1', displayName: 'Admin' } })
  assert.equal(result.assignedTo, 'user_2')
  assert.deepEqual(calls, [['lead.assigned', 'user_2']])
})
