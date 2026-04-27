/** @file src/features/notifications/runtime/notification-hooks.js */

/**
 * Register event listeners for all known notification events.
 *
 * @param {{
 *   eventBus: { on: (event: string, handler: (payload: any) => void|Promise<void>) => () => void },
 *   orchestrator: { handleEvent: (event: string, payload?: Record<string, any>) => Promise<Array<Record<string, any>>> },
 *   eventNames: string[],
 * }} options
 * @returns {{ dispose: () => void }}
 */
export function registerNotificationHooks(options) {
  const unsubs = [];

  for (const eventName of options.eventNames || []) {
    const off = options.eventBus.on(eventName, (payload) => options.orchestrator.handleEvent(eventName, payload));
    unsubs.push(off);
  }

  return {
    dispose() {
      for (const off of unsubs) off();
    },
  };
}

export default registerNotificationHooks;
