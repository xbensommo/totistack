/**
 * @file src/modules/documents/examples/sampleDocument.js
 * Shared sample payloads for commercial document generators.
 */

/**
 * Creates a stable ISO timestamp string.
 * @param {number} [offsetDays=0]
 * @returns {string}
 */
function createIsoDate(offsetDays = 0) {
  return new Date(Date.now() + (offsetDays * 24 * 60 * 60 * 1000)).toISOString();
}

export const sampleDocument = {
  id: 'doc_001',
  type: 'quotation',
  status: 'draft',
  currency: 'NAD',
  vatRate: 15,
  issuerSnapshot: {
    companyName: 'Totisoft CC',
    contactName: 'Mr. Sommo B. Petrus',
    email: 'sommo@totisoft.com',
    phone: '+264 85 814 0709',
    address: 'Rundu (Ndama Ext 9), Namibia',
  },
  clientSnapshot: {
    companyName: 'Enter Client',
    contactName: '',
    email: '',
    phone: '+264 81',
    address: 'Erf 6846 Dissipel Street,\nMaroela Windhoek, Namibia',
  },
  lineItems: [
    { description: 'Website design and development', qty: 1, unitPrice: 6500 },
    { description: 'Managed care and support setup', qty: 1, unitPrice: 1049 },
    { description: 'Business email configuration', qty: 10, unitPrice: 150 },
  ],
  terms: [
    'Quotation validity is 14 days from issue date.',
    'Work begins after written approval and deposit confirmation.',
    'Custom changes outside approved scope are billed separately.',
  ],
  dates: {
    issuedAt: createIsoDate(),
    validUntil: createIsoDate(14),
  },
  metadata: {
    subject: 'Website and business systems quotation',
    reference: 'TOTI-QUO-001',
    actorId: 'user_001',
    actorName: 'System User',
  },
  signature: {
    name: 'Mr. Sommo B. Petrus',
    title: 'Managing Director',
    signedAt: createIsoDate(),
    markUrl: '',
    mode: 'initials',
    initials: 'SP',
  },
};

export const invoiceSampleDocument = {
  id: 'inv_001',
  type: 'invoice',
  status: 'draft',
  currency: 'NAD',
  vatRate: 15,
  issuerSnapshot: {
    companyName: 'Totisoft CC',
    contactName: 'Mr. Sommo B. Petrus',
    email: 'sommo@totisoft.com',
    phone: '+264 85 814 0709',
    address: 'Rundu (Ndama Ext 9), Namibia',
  },
  clientSnapshot: {
    companyName: 'Client Company',
    contactName: 'Accounts Department',
    email: 'accounts@example.com',
    phone: '+264 81 000 0000',
    address: 'Windhoek, Namibia',
  },
  lineItems: [
    { description: 'Website maintenance and managed care - March 2026', qty: 1, unitPrice: 1049 },
    { description: 'Business email mailbox subscriptions', qty: 10, unitPrice: 150 },
    { description: 'Support retainer and technical administration', qty: 1, unitPrice: 850 },
  ],
  terms: [
    'Payment is due within 7 days of invoice date.',
    'Please use the invoice number as payment reference.',
    'Late settlement may delay support or service continuation.',
  ],
  dates: {
    issuedAt: createIsoDate(),
    dueAt: createIsoDate(7),
  },
  metadata: {
    subject: 'Monthly support and service invoice',
    reference: 'TOTI-INV-001',
    purchaseOrder: 'PO-001',
    actorId: 'user_001',
    actorName: 'System User',
  },
  payment: {
    instructions: 'Bank transfer only. Send proof of payment to sommo@totisoft.com.',
    bankName: 'Bank Windhoek',
    accountName: 'Totisoft CC',
    accountNumber: '1234567890',
    branchCode: '482172',
  },
  signature: {
    name: 'Mr. Sommo B. Petrus',
    title: 'Managing Director',
    signedAt: createIsoDate(),
    markUrl: '',
    mode: 'initials',
    initials: 'SP',
  },
};
