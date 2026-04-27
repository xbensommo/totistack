/** @file src/features/notifications/utils/notification.helpers.js */

/**
 * Create a stable notification identifier.
 *
 * @returns {string}
 */
export function createNotificationId() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Replace {{ token }} placeholders in a template string.
 *
 * @param {string} template
 * @param {Record<string, unknown>} variables
 * @returns {string}
 */
export function interpolateTemplate(template = '', variables = {}) {
  return String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, token) => {
    const parts = token.split('.');
    let value = variables;

    for (const part of parts) {
      value = value?.[part];
    }

    return value == null ? '' : String(value);
  });
}

/**
 * Safely normalize a date value to ISO.
 *
 * @param {Date|string|number|null|undefined} value
 * @returns {string|null}
 */
export function toIsoString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Normalize a boolean-ish value.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function toBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}
