/**
 * @file src/modules/documents/domain/normalizeDocumentPayload.js
 * Normalizes document payloads before preview or PDF rendering.
 */

import { computeDocumentTotals } from './computeDocumentTotals.js';

/**
 * Coerces a value to a finite number.
 * @param {unknown} value
 * @returns {number}
 */
function toNumber(value) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

/**
 * Normalizes a single line item.
 * @param {Record<string, any>} item
 * @param {number} index
 * @returns {Record<string, any>}
 */
function normalizeLineItem(item = {}, index = 0) {
  const qty = toNumber(item.qty || 0);
  const unitPrice = toNumber(item.unitPrice || 0);

  return {
    id: item.id || `line_${index + 1}`,
    description: String(item.description || '').trim(),
    qty,
    unitPrice,
    total: qty * unitPrice,
    ...item,
    qty,
    unitPrice,
    total: qty * unitPrice,
  };
}

/**
 * Normalizes a partial party snapshot.
 * @param {Record<string, any>} party
 * @returns {{companyName: string, contactName: string, email: string, phone: string, address: string}}
 */
function normalizeParty(party = {}) {
  return {
    companyName: String(party.companyName || ''),
    contactName: String(party.contactName || ''),
    email: String(party.email || ''),
    phone: String(party.phone || ''),
    address: String(party.address || ''),
  };
}

/**
 * Normalizes a document payload for editor, preview, and PDF generation.
 * @param {Record<string, any>} [document={}]
 * @returns {Record<string, any>}
 */
export function normalizeDocumentPayload(document = {}) {
  const normalizedLineItems = Array.isArray(document.lineItems)
    ? document.lineItems.map((item, index) => normalizeLineItem(item, index))
    : [];

  const vatRate = toNumber(document.vatRate || 0);
  const totals = computeDocumentTotals({
    lineItems: normalizedLineItems,
    vatRate,
  });

  return {
    ...document,
    type: String(document.type || 'quotation'),
    status: String(document.status || 'draft'),
    number: String(document.number || ''),
    currency: String(document.currency || 'NAD'),
    vatRate,
    notes: String(document.notes || ''),
    lineItems: normalizedLineItems,
    terms: Array.isArray(document.terms) ? document.terms.map((item) => String(item)) : [],
    dates: {
      issuedAt: document.dates?.issuedAt || '',
      validUntil: document.dates?.validUntil || '',
      dueAt: document.dates?.dueAt || '',
      ...document.dates,
    },
    metadata: {
      subject: '',
      reference: '',
      purchaseOrder: '',
      actorId: '',
      actorName: '',
      ...document.metadata,
    },
    issuerSnapshot: normalizeParty(document.issuerSnapshot),
    clientSnapshot: normalizeParty(document.clientSnapshot),
    payment: {
      instructions: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      branchCode: '',
      ...document.payment,
    },
    signature: {
      name: '',
      title: '',
      signedAt: '',
      markUrl: '',
      mode: 'upload',
      initials: '',
      ...document.signature,
    },
    stamp: {
      mode: 'draft',
      text: 'DRAFT',
      opacity: 0.15,
      rotation: -35,
      position: 'center',
      ...document.stamp,
    },
    ...totals,
  };
}
