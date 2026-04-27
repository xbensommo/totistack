import { WATERMARK_PRESETS } from './constants.js';

function toNumber(value) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeLineItem(item = {}, index = 0) {
  const quantity = toNumber(item.quantity);
  const unitPrice = toNumber(item.unitPrice);
  const total = quantity * unitPrice;

  return {
    id: item.id || `item_${index + 1}`,
    description: String(item.description || '').trim(),
    quantity,
    unitPrice,
    total,
  };
}

function normalizeList(list, fallbackLabel) {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => ({
    id: item.id || `${fallbackLabel}_${index + 1}`,
    label: String(item.label || item.title || `${fallbackLabel} ${index + 1}`),
    value: String(item.value || item.description || ''),
  }));
}

export function resolveWatermark(layout = {}) {
  const preset = layout?.watermark?.preset || 'none';
  const matchedPreset = WATERMARK_PRESETS.find((entry) => entry.value === preset) || WATERMARK_PRESETS[0];

  return {
    ...matchedPreset,
    ...(layout.watermark || {}),
    text: layout?.watermark?.text || matchedPreset.text,
  };
}

export function normalizeDocument(document = {}) {
  const lineItems = Array.isArray(document?.content?.lineItems)
    ? document.content.lineItems.map(normalizeLineItem)
    : [];

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = toNumber(document?.finance?.taxRate);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    ...document,
    meta: {
      revision: 1,
      status: 'draft',
      currency: 'NAD',
      ...document.meta,
    },
    brand: {
      logoUrl: '',
      logoFileUrl: '',
      primaryColor: '#0f172a',
      accentColor: '#0f766e',
      companyName: '',
      legalLine: '',
      contactLine: '',
      ...document.brand,
    },
    layout: {
      ...document.layout,
      watermark: resolveWatermark(document.layout),
    },
    content: {
      summaryHtml: '',
      notesHtml: '',
      richBlocks: [],
      clauses: [],
      scopeItems: [],
      milestones: [],
      changeItems: [],
      ...document.content,
      lineItems,
      clauses: normalizeList(document?.content?.clauses, 'Clause'),
      scopeItems: normalizeList(document?.content?.scopeItems, 'Scope item'),
      milestones: normalizeList(document?.content?.milestones, 'Milestone'),
      changeItems: normalizeList(document?.content?.changeItems, 'Change'),
    },
    finance: {
      ...document.finance,
      taxRate,
      subtotal,
      taxAmount,
      total,
    },
  };
}
