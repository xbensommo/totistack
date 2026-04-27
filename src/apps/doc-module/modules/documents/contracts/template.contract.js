/** @file src/modules/documents/contracts/template.contract.js */
export const DEFAULT_TEMPLATE = {
  id: 'default-quotation',
  name: 'Default quotation',
  type: 'quotation',
  page: { size: 'A4', orientation: 'portrait', margin: { top: 60, right: 40, bottom: 50, left: 40 } },
  branding: { logoUrl: null, companyName: 'Totisoft CC', primaryColor: '#102B46', secondaryColor: '#2B5A88', accentColor: '#1B7EE4', textColor: '#1C1C1C', mutedTextColor: '#6B7280', legalLine: 'Business Systems Developer', contactLine: 'www.totisoft.com' },
  header: { enabled: true, height: 90, logoAlign: 'left', showIssuerDetails: true, showDocumentMeta: true },
  footer: { enabled: true, height: 28, showPageNumbers: true, showGeneratedAt: true, showCompanyLegal: true, disclaimer: 'This document is system-generated and subject to listed terms.' },
  signatureBlock: { enabled: true, showDate: true, showName: true, showTitle: true, showMark: true, label: 'Authorized Signature' },
  stamp: { enabled: true, mode: 'draft', text: 'DRAFT', opacity: 0.15, rotation: -35, position: 'center' },
  typography: { titleSize: 22, bodySize: 10, smallSize: 8, lineHeight: 14 },
  table: { columns: [ { key: 'description', label: 'Description', width: 270, align: 'left' }, { key: 'qty', label: 'Qty', width: 60, align: 'right' }, { key: 'unitPrice', label: 'Rate', width: 90, align: 'right' }, { key: 'total', label: 'Amount', width: 95, align: 'right' } ], rowHeight: 22, headerHeight: 24 }
};


export const INVOICE_TEMPLATE = {
  id: 'default-invoice',
  name: 'Default invoice',
  type: 'invoice',
  page: { size: 'A4', orientation: 'portrait', margin: { top: 60, right: 40, bottom: 50, left: 40 } },
  branding: { logoUrl: null, companyName: 'Totisoft CC', primaryColor: '#102B46', secondaryColor: '#2B5A88', accentColor: '#1B7EE4', textColor: '#1C1C1C', mutedTextColor: '#6B7280', legalLine: 'Business Systems Developer', contactLine: 'www.totisoft.com' },
  header: { enabled: true, height: 90, logoAlign: 'left', showIssuerDetails: true, showDocumentMeta: true },
  footer: { enabled: true, height: 28, showPageNumbers: true, showGeneratedAt: true, showCompanyLegal: true, disclaimer: 'This document is system-generated and subject to listed terms.' },
  signatureBlock: { enabled: true, showDate: true, showName: true, showTitle: true, showMark: true, label: 'Authorized Signature' },
  stamp: { enabled: true, mode: 'draft', text: 'DRAFT', opacity: 0.15, rotation: -35, position: 'center' },
  typography: { titleSize: 22, bodySize: 10, smallSize: 8, lineHeight: 14 },
  table: { columns: [ { key: 'description', label: 'Description', width: 270, align: 'left' }, { key: 'qty', label: 'Qty', width: 60, align: 'right' }, { key: 'unitPrice', label: 'Rate', width: 90, align: 'right' }, { key: 'total', label: 'Amount', width: 95, align: 'right' } ], rowHeight: 22, headerHeight: 24 }
};
