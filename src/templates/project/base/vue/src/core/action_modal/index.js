/**
 * @file src/core/action_modal/index.js
 * @description Minimal business-action executor with optional confirmation.
 */

export function defineActionDefinitions(definitions = {}) {
  return Object.freeze({ ...definitions })
}

export function createActionModalService({ actions = {}, confirm, onError, onSuccess } = {}) {
  async function runAction(actionKey, context = {}) {
    const definition = actions[actionKey]

    if (!definition) {
      const error = new Error(`Unknown action: ${actionKey}`)
      error.code = 'UNKNOWN_ACTION'
      throw error
    }

    try {
      const confirmation = typeof definition.confirm === 'function'
        ? await definition.confirm(context)
        : definition.confirm || null

      if (confirmation && typeof confirm === 'function') {
        const accepted = await confirm(confirmation, context)
        if (!accepted) {
          return { ok: false, cancelled: true, actionKey }
        }
      }

      const result = await definition.run(context)
      if (typeof definition.onSuccess === 'function') {
        await definition.onSuccess(result, context)
      }
      if (typeof onSuccess === 'function') {
        await onSuccess(result, context, definition)
      }
      return { ok: true, actionKey, result }
    } catch (error) {
      if (typeof definition.onError === 'function') {
        await definition.onError(error, context)
      }
      if (typeof onError === 'function') {
        await onError(error, context, definition)
      }
      throw error
    }
  }

  return {
    runAction,
  }
}

export default createActionModalService
