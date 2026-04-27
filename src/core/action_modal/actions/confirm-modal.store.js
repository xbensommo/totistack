/**
 * @file src/core/actions/confirm-modal.store.js
 * @description Lightweight modal store for one global confirm host.
 */

import { shallowRef } from 'vue';

/**
 * Create the shared confirm modal store.
 *
 * @returns {{
 *   state: import('vue').ShallowRef<Record<string, any>>,
 *   open: (request: Record<string, any>) => Promise<boolean>,
 *   resolve: (value: boolean) => void,
 *   close: () => void,
 * }}
 */
export function createConfirmModalStore() {
  const state = shallowRef({
    isOpen: false,
    request: null,
    resolver: null,
  });

  return {
    state,
    open(request) {
      return new Promise((resolve) => {
        state.value = {
          isOpen: true,
          request,
          resolver: resolve,
        };
      });
    },
    resolve(value) {
      const resolver = state.value?.resolver;
      if (typeof resolver === 'function') {
        resolver(Boolean(value));
      }
      state.value = {
        isOpen: false,
        request: null,
        resolver: null,
      };
    },
    close() {
      this.resolve(false);
    },
  };
}
