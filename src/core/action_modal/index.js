/**
 * @file src/core/action_modal/index.js
 * @description Totistack action pipeline exports plus legacy modal-service adapter.
 */

export * from './actions/action.constants.js'
export * from './actions/action.errors.js'
export * from './actions/action.utils.js'
export * from './actions/confirm-modal.store.js'
export * from './actions/create-action-executor.js'
export * from './actions/create-action-registry.js'
export * from './actions/create-confirm-gateway.js'
export * from './actions/create-modal-confirm-adapter.js'
export * from './plugins/action-plugin.js'
export * from './composables/use-action-executor.js'
export * from './composables/use-confirm-action.js'
export * from './composables/use-run-action.js'

export { defineActionDefinitions, createActionModalService, default } from './legacy-service.js'
