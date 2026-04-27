/**
 * @file src/core/composables/use-confirm-action.js
 * @description Vue composable for the shared confirm-action helper.
 */

import { inject } from 'vue';
import { ACTION_CONFIRM_KEY } from '../plugins/action-plugin.js';

/**
 * Access the shared confirm-action helper.
 *
 * @returns {(request: Record<string, any>) => Promise<boolean>}
 */
export function useConfirmAction() {
  const confirmAction = inject(ACTION_CONFIRM_KEY, null);

  if (typeof confirmAction !== 'function') {
    throw new Error('Confirm action helper not found. Install the action plugin first.');
  }

  return confirmAction;
}
