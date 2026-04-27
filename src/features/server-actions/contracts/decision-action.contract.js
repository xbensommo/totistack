/** @file src/features/server-actions/contracts/decision-action.contract.js */

export const ACTION_EXECUTION = Object.freeze({
  CLIENT: 'client',
  SERVER: 'server',
  AUTOMATED: 'automated',
})

export const ACTION_DANGER = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
})

export function defineServerAction(definition) {
  validateServerActionDefinition(definition)
  return Object.freeze({ ...definition, execution: ACTION_EXECUTION.SERVER })
}

export function validateServerActionDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    throw new Error('Server action definition must be an object.')
  }

  const required = ['id', 'label', 'permission', 'entityType']
  for (const key of required) {
    if (!definition[key] || typeof definition[key] !== 'string') {
      throw new Error(`Server action definition requires string field: ${key}`)
    }
  }

  if (definition.execution && definition.execution !== ACTION_EXECUTION.SERVER) {
    throw new Error(`Server action ${definition.id} must use execution: "server".`)
  }

  return true
}
