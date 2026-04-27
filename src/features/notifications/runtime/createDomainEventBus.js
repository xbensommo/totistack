/** @file src/features/notifications/runtime/createDomainEventBus.js */

/**
 * Minimal event bus used by the notifications feature.
 *
 * @returns {{
 *   emit: (event: string, payload?: any) => void,
 *   on: (event: string, handler: (payload: any) => void|Promise<void>) => () => void,
 * }}
 */
export function createDomainEventBus() {
  const listeners = new Map();

  function emit(event, payload) {
    const handlers = listeners.get(event) || new Set();
    for (const handler of handlers) {
      handler(payload);
    }

    const wildcardHandlers = listeners.get('*') || new Set();
    for (const handler of wildcardHandlers) {
      handler({ event, payload });
    }
  }

  function on(event, handler) {
    const handlers = listeners.get(event) || new Set();
    handlers.add(handler);
    listeners.set(event, handlers);

    return () => {
      const current = listeners.get(event);
      current?.delete(handler);
      if (!current?.size) listeners.delete(event);
    };
  }

  return {
    emit,
    on,
  };
}

export default createDomainEventBus;
