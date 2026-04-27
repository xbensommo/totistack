/**
 * @file src/core/plugins/action-plugin.js
 * @description Vue plugin installer for Totistack action pipeline.
 */

import { createConfirmGateway } from '../actions/create-confirm-gateway.js';
import { createModalConfirmAdapter } from '../actions/create-modal-confirm-adapter.js';
import { createActionExecutor } from '../actions/create-action-executor.js';
import { createConfirmModalStore } from '../actions/confirm-modal.store.js';

/**
 * Injection key for the shared action executor.
 * @type {string}
 */
export const ACTION_EXECUTOR_KEY = 'totistack:action-executor';

/**
 * Injection key for the shared confirm modal store.
 * @type {string}
 */
export const CONFIRM_MODAL_STORE_KEY = 'totistack:confirm-modal-store';

/**
 * Injection key for the shared confirm function.
 * @type {string}
 */
export const ACTION_CONFIRM_KEY = 'totistack:confirm-action';

/**
 * Injection key for the simplified run helper.
 * @type {string}
 */
export const ACTION_RUNNER_KEY = 'totistack:run-action';

/**
 * Install the Totistack action pipeline.
 *
 * @param {import('vue').App} app
 * @param {{
 *   actions?: Array<Record<string, any>>,
 *   onEvent?: Function,
 *   normalizeError?: Function,
 * }} [options]
 * @returns {{
 *   executor: ReturnType<typeof createActionExecutor>,
 *   confirmModalStore: ReturnType<typeof createConfirmModalStore>,
 *   confirmAction: (request: Record<string, any>) => Promise<boolean>,
 *   runAction: (typeOrInput: string|Record<string, any>, payload?: Record<string, any>, extra?: Record<string, any>) => Promise<any>,
 * }}
 */
export function installActionPipeline(app, options = {}) {
  const confirmModalStore = createConfirmModalStore();
  const confirmAction = createModalConfirmAdapter(confirmModalStore);
  const confirmGateway = createConfirmGateway(confirmAction);

  const executor = createActionExecutor({
    confirmGateway,
    onEvent: options.onEvent,
    normalizeError: options.normalizeError,
  });

  if (Array.isArray(options.actions) && options.actions.length > 0) {
    executor.registerMany(options.actions);
  }

  const runAction = (typeOrInput, payload = null, extra = {}) => {
    if (typeof typeOrInput === 'string') {
      return executor.execute({
        type: typeOrInput,
        payload,
        ...extra,
      });
    }

    return executor.execute(typeOrInput || {});
  };

  app.provide(ACTION_EXECUTOR_KEY, executor);
  app.provide(CONFIRM_MODAL_STORE_KEY, confirmModalStore);
  app.provide(ACTION_CONFIRM_KEY, confirmAction);
  app.provide(ACTION_RUNNER_KEY, runAction);
  app.config.globalProperties.$actions = executor;
  app.config.globalProperties.$confirmModal = confirmModalStore;
  app.config.globalProperties.$confirmAction = confirmAction;
  app.config.globalProperties.$runAction = runAction;

  return { executor, confirmModalStore, confirmAction, runAction };
}
