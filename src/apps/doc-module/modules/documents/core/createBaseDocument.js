import { createId } from '../utils/ids.js';
import { DEFAULT_PAGE_MARGIN } from './constants.js';

function createParty() {
  return {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  };
}

function createSignature() {
  return {
    name: '',
    title: '',
    mode: 'upload',
    initials: '',
    imageUrl: '',
    drawnDataUrl: '',
    signedOn: '',
  };
}

export function createBaseDocument(type, label) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    meta: {
      id: createId(type),
      type,
      title: label,
      number: '',
      status: 'draft',
      currency: 'NAD',
      issuedOn: today,
      effectiveOn: today,
      dueOn: '',
      expiresOn: '',
      reference: '',
      revision: 1,
    },
    brand: {
      companyName: 'Totisoft Investment CC',
      logoUrl: '',
      logoFileUrl: '',
      primaryColor: '#0f172a',
      accentColor: '#0f766e',
      legalLine: 'Digital systems, web infrastructure, and managed business operations.',
      contactLine: 'www.totisoft.com · sommo@totisoft.com · +264 85 814 0709',
    },
    layout: {
      pageSize: 'A4',
      margins: { ...DEFAULT_PAGE_MARGIN },
      header: {
        enabled: true,
        height: 92,
        leftText: 'Totisoft CC',
        rightText: '',
      },
      footer: {
        enabled: true,
        height: 40,
        leftText: 'Confidential business document',
        centerText: '',
        rightText: 'Prepared by Totisoft',
        showPageNumbers: true,
      },
      watermark: {
        preset: 'draft',
        text: 'DRAFT',
        opacity: 0.08,
        rotation: -28,
      },
    },
    parties: {
      issuer: createParty(),
      client: createParty(),
    },
    content: {
      summaryHtml: '<p>Document summary goes here.</p>',
      notesHtml: '',
      richBlocks: [],
      clauses: [],
      scopeItems: [],
      milestones: [],
      lineItems: [],
      changeItems: [],
    },
    finance: {
      taxRate: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      paymentTermsHtml: '<p>Payment terms go here.</p>',
    },
    signatures: {
      issuer: createSignature(),
      client: createSignature(),
    },
    workflow: {
      approvalRequired: false,
      requiresClientSignature: false,
    },
  };
}
