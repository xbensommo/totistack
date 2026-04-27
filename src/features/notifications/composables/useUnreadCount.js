/** @file src/features/notifications/composables/useUnreadCount.js */

import { computed } from 'vue';
import { useNotificationsStore } from '../stores/useNotificationsStore.js';

/**
 * Read-only unread count composable.
 *
 * @returns {import('vue').ComputedRef<number>}
 */
export function useUnreadCount() {
  const store = useNotificationsStore();
  return computed(() => store.unreadCount);
}

export default useUnreadCount;
