/** @file src/features/notifications/composables/useNotifications.js */

import { storeToRefs } from 'pinia';
import { useNotificationsStore } from '../stores/useNotificationsStore.js';

/**
 * Convenience wrapper for notifications state.
 *
 * @returns {ReturnType<typeof useNotificationsStore> & Record<string, any>}
 */
export function useNotifications() {
  const store = useNotificationsStore();
  const refs = storeToRefs(store);

  return {
    ...store,
    ...refs,
  };
}

export default useNotifications;
