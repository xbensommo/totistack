export const WATERMARK_PRESETS = [
  { value: 'none', label: 'None', text: '', opacity: 0, rotation: -28 },
  { value: 'draft', label: 'Draft', text: 'DRAFT', opacity: 0.08, rotation: -28 },
  { value: 'confidential', label: 'Confidential', text: 'CONFIDENTIAL', opacity: 0.06, rotation: -28 },
  { value: 'approved', label: 'Approved', text: 'APPROVED', opacity: 0.08, rotation: -28 },
  { value: 'signed', label: 'Signed', text: 'SIGNED', opacity: 0.08, rotation: -28 },
  { value: 'paid', label: 'Paid', text: 'PAID', opacity: 0.08, rotation: -28 },
  { value: 'cancelled', label: 'Cancelled', text: 'CANCELLED', opacity: 0.08, rotation: -28 },
];

export const BASE_STATUSES = [
  'draft',
  'sent',
  'approved',
  'signed',
  'active',
  'paid',
  'completed',
  'cancelled',
];

export const PAGE_DIMENSIONS = {
  A4: { width: 794, height: 1123 },
};

export const DEFAULT_PAGE_MARGIN = {
  top: 64,
  right: 52,
  bottom: 64,
  left: 52,
};
