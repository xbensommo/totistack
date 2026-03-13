/**
 * @file hooks.js
 * @description Minimal async hook system for Totistack installers.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

/**
 * Creates an async hook bus.
 *
 * @returns {{
 *   on: (name: string, handler: Function) => Function,
 *   once: (name: string, handler: Function) => Function,
 *   off: (name: string, handler: Function) => void,
 *   has: (name: string) => boolean,
 *   list: () => Record<string, number>,
 *   run: (name: string, payload?: any, context?: any) => Promise<any>
 * }}
 */
export function createHookSystem() {
  const registry = new Map();

  /**
   * Gets a hook bucket.
   *
   * @param {string} name
   * @returns {Set<Function>}
   */
  function bucket(name) {
    if (!registry.has(name)) registry.set(name, new Set());
    return registry.get(name);
  }

  /**
   * Registers a hook handler.
   *
   * @param {string} name
   * @param {Function} handler
   * @returns {Function}
   */
  function on(name, handler) {
    if (!name || typeof name !== 'string') {
      throw new TypeError('Hook name must be a non-empty string.');
    }

    if (typeof handler !== 'function') {
      throw new TypeError(`Hook "${name}" handler must be a function.`);
    }

    bucket(name).add(handler);
    return () => off(name, handler);
  }

  /**
   * Registers a one-time hook handler.
   *
   * @param {string} name
   * @param {Function} handler
   * @returns {Function}
   */
  function once(name, handler) {
    const wrapped = async (...args) => {
      off(name, wrapped);
      return handler(...args);
    };

    return on(name, wrapped);
  }

  /**
   * Removes a hook handler.
   *
   * @param {string} name
   * @param {Function} handler
   */
  function off(name, handler) {
    const handlers = registry.get(name);
    if (!handlers) return;

    handlers.delete(handler);
    if (!handlers.size) registry.delete(name);
  }

  /**
   * Checks whether a hook exists.
   *
   * @param {string} name
   * @returns {boolean}
   */
  function has(name) {
    return Boolean(registry.get(name)?.size);
  }

  /**
   * Lists hook counts.
   *
   * @returns {Record<string, number>}
   */
  function list() {
    return Object.fromEntries(
      [...registry.entries()].map(([name, handlers]) => [name, handlers.size])
    );
  }

  /**
   * Runs all handlers for a given hook in sequence.
   * If a handler returns a value, that value becomes the next payload.
   *
   * @param {string} name
   * @param {any} [payload]
   * @param {any} [context]
   * @returns {Promise<any>}
   */
  async function run(name, payload, context) {
    const handlers = registry.get(name);
    if (!handlers?.size) return payload;

    let current = payload;

    for (const handler of handlers) {
      const next = await handler(current, context);
      if (typeof next !== 'undefined') current = next;
    }

    return current;
  }

  return { on, once, off, has, list, run };
}
