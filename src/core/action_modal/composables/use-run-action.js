/**
 * @file src/core/composables/use-run-action.js
 * @description Vue composable for the simplified action runner.
 */

import { inject } from 'vue';
import { ACTION_RUNNER_KEY } from '../plugins/action-plugin.js';

/**
 * Access the simplified action runner.
 *
 * Examples:
 * - await runAction('auth.user.disable', { reason: 'Suspended' }, { target: user })
 * - await runAction({ type: 'crm.lead.archive', target: lead })
 *
 * @returns {(typeOrInput: string|Record<string, any>, payload?: Record<string, any>, extra?: Record<string, any>) => Promise<any>}
 */
export function useRunAction() {
  const runAction = inject(ACTION_RUNNER_KEY, null);

  if (typeof runAction !== 'function') {
    throw new Error('Action runner helper not found. Install the action plugin first.');
  }

  return runAction;
}
