/**
 * @file src/core/actions/create-action-executor.js
 * @description Central enterprise action pipeline for Totistack.
 */

import { ACTION_STATUS } from './action.constants.js';
import { ActionCancelledError } from './action.errors.js';
import {
  createActionContext,
  normalizeConfirmation,
  validateActionDefinition,
} from './action.utils.js';

/**
 * @typedef {import('./action.utils.js').ActionDefinition} ActionDefinition
 */

/**
 * @typedef {Object} ActionEvent
 * @property {string} stage
 * @property {Record<string, any>} context
 * @property {unknown} [result]
 * @property {unknown} [error]
 */

/**
 * Create a central action executor.
 *
 * @param {Object} options
 * @param {{ request: (request: Record<string, any>) => Promise<boolean> }} options.confirmGateway
 * @param {(event: ActionEvent) => void|Promise<void>} [options.onEvent]
 * @param {(error: unknown, context: Record<string, any>) => unknown} [options.normalizeError]
 * @returns {{
 * register: (definition: ActionDefinition) => void,
 * registerMany: (definitions: ActionDefinition[]) => void,
 * has: (type: string) => boolean,
 * execute: (input: Record<string, any>) => Promise<any>,
 * getDefinition: (type: string) => ActionDefinition | undefined,
 * }}
 */
export function createActionExecutor({ confirmGateway, onEvent, normalizeError } = {}) {
  if (!confirmGateway || typeof confirmGateway.request !== 'function') {
    throw new TypeError('createActionExecutor requires a confirmGateway with request().');
  }

  /** @type {Map<string, ActionDefinition>} */
  const definitions = new Map();

  async function emit(stage, context, extra = {}) {
    if (typeof onEvent === 'function') {
      await onEvent({ stage, context, ...extra });
    }
  }

  function register(definition) {
    const valid = validateActionDefinition(definition);
    definitions.set(valid.type, valid);
  }

  function registerMany(items = []) {
    items.forEach(register);
  }

  async function execute(input = {}) {
    const context = createActionContext(input);
    const definition = definitions.get(context.type);

    if (!definition) {
      throw new Error(`Unknown action type: ${context.type}`);
    }

    context.status = ACTION_STATUS.IDLE;
    context.definition = definition;

    try {
      await emit('before:resolve', context);

      const confirmResponse = typeof definition.confirm === 'function'
        ? await definition.confirm(context)
        : null;
      const confirmConfig = normalizeConfirmation(confirmResponse, context.type);

      if (confirmConfig) {
        context.status = ACTION_STATUS.PENDING_CONFIRMATION;
        context.confirmation = confirmConfig;
        await emit('before:confirm', context);

        const approved = await confirmGateway.request(confirmConfig);

        if (!approved) {
          context.status = ACTION_STATUS.CANCELLED;
          await emit('cancelled', context);
          throw new ActionCancelledError('Action cancelled by user.', { type: context.type, target: context.target });
        }
      }

      context.status = ACTION_STATUS.RUNNING;
      await emit('before:run', context);

      const result = await definition.run(context);

      context.status = ACTION_STATUS.SUCCEEDED;
      context.result = result;

      if (typeof definition.onSuccess === 'function') {
        await definition.onSuccess(context);
      }

      await emit('succeeded', context, { result });
      return result;
    } catch (error) {
      context.status = context.status === ACTION_STATUS.CANCELLED ? ACTION_STATUS.CANCELLED : ACTION_STATUS.FAILED;
      context.error = typeof normalizeError === 'function' ? normalizeError(error, context) : error;

      if (context.status === ACTION_STATUS.FAILED && typeof definition.onError === 'function') {
        await definition.onError(context.error, context);
      }

      await emit(context.status === ACTION_STATUS.CANCELLED ? 'cancelled' : 'failed', context, { error: context.error });
      throw context.error;
    }
  }

  return {
    register,
    registerMany,
    has(type) {
      return definitions.has(type);
    },
    getDefinition(type) {
      return definitions.get(type);
    },
    execute,
  };
}
