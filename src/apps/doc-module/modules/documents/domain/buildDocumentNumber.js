/** @file src/modules/documents/domain/buildDocumentNumber.js */
const TYPE_PREFIX = {
  quotation: 'QUO',
  invoice: 'INV',
  proposal: 'PRO',
  contract: 'CON',
};

/**
 * Resolve a numbering prefix for a document type.
 *
 * @param {{ type: string, prefix?: string, prefixMap?: Record<string, string>, definition?: Record<string, any> }} options
 * @returns {string}
 */
export function resolveDocumentPrefix({ type, prefix, prefixMap = {}, definition } = {}) {
  const explicitPrefix = String(
    prefix
    || definition?.numberingPrefix
    || prefixMap?.[type]
    || TYPE_PREFIX[type]
    || ''
  ).trim().toUpperCase();

  if (explicitPrefix) {
    return explicitPrefix;
  }

  const safeType = String(type || 'DOC').trim();
  const initials = safeType
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (initials || safeType.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 4).toUpperCase() || 'DOC');
}

/**
 * Build a human-readable document number.
 *
 * @param {{ type: string, year: number|string, nextNumber: number|string, prefix?: string, prefixMap?: Record<string, string>, definition?: Record<string, any> }} options
 * @returns {string}
 */
export function buildDocumentNumber({ type, year, nextNumber, prefix, prefixMap, definition }) {
  const resolvedPrefix = resolveDocumentPrefix({ type, prefix, prefixMap, definition });
  const serial = String(nextNumber).padStart(6, '0');
  return `${resolvedPrefix}-${year}-${serial}`;
}
