/**
 * @file src/apps/finance/services/financeFormatters.js
 * @description Shared finance formatting helpers.
 */

/**
 * @param {number} value
 * @param {string} [currency='NAD']
 * @returns {string}
 */
export function formatMoney(value, currency = 'NAD') {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

/**
 * @param {string | Date | number | null | undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-NA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}
