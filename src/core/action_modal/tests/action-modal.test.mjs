import test from 'node:test'
import assert from 'node:assert/strict'
import { createActionModalService } from '../legacy-service.js'

test('createActionModalService confirms before running', async () => {
  const calls = []
  const service = createActionModalService({
    actions: {
      'crm.lead.convert': {
        confirm: () => ({ title: 'Confirm' }),
        async run(context) {
          calls.push(context.payload.id)
          return { ok: true }
        },
      },
    },
    confirm: async () => true,
  })

  const result = await service.runAction('crm.lead.convert', { payload: { id: 'lead_1' } })
  assert.equal(result.ok, true)
  assert.deepEqual(calls, ['lead_1'])
})

test('createActionModalService returns cancelled when confirmation is rejected', async () => {
  const service = createActionModalService({
    actions: {
      'crm.lead.convert': {
        confirm: () => ({ title: 'Confirm' }),
        async run() {
          throw new Error('should not run')
        },
      },
    },
    confirm: async () => false,
  })

  const result = await service.runAction('crm.lead.convert', { payload: { id: 'lead_1' } })
  assert.equal(result.cancelled, true)
})
