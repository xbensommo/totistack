/**
 * @file boot/bootstrap.js
 * @description Application bootstrap sequence.
 */

import { useAppStore } from '@app/stores/appStore/index.js';

/**
 * Bootstrap the application.
 *
 * The project relies on src/generated/* as the assembly layer. Bootstrap keeps
 * itself intentionally small and only starts cross-cutting runtime services.
 *
 * @returns {Promise<void>}
 */
export async function bootstrapApp() {
  if (import.meta.env.SSR) {
    return;
  }

  const store = useAppStore();
  await store.initAccessRuntime();
}
