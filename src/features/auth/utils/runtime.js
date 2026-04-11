/**
 * @file src/features/auth/utils/runtime.js
 */

export function isBrowserRuntime() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function createEventEmitter() {
  const listeners = new Map();

  return {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => listeners.get(event)?.delete(handler);
    },
    emit(event, payload) {
      const handlers = listeners.get(event);
      if (!handlers) return;
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          console.error('[AuthEventEmitter] Listener failed:', error);
        }
      }
    },
  };
}
