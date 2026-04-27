/**
 * @file src/core/composables/use-action-executor.js
 * @description Vue composable for consuming the shared action executor.
 */

import { inject } from 'vue';
import { ACTION_EXECUTOR_KEY } from '../plugins/action-plugin.js';

/**
 * Access the shared action executor.
 *
 * @returns {{ execute: Function, has: Function, getDefinition: Function, register: Function, registerMany: Function }}
 */
export function useActionExecutor() {
  const executor = inject(ACTION_EXECUTOR_KEY, null);

  if (!executor) {
    throw new Error('Action executor not found. Install the action plugin first.');
  }

  return executor;
}
