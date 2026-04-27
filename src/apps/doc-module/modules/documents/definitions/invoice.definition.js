import { createBaseDocument } from '../core/createBaseDocument.js';
import { SectionFactories } from '../core/buildRenderSections.js';
import { validateSharedDocument } from '../core/validators.js';
import { partyIssuer }  from '../config/Issuer.js';

export const invoiceDefinition = {
  id: 'invoice',
  label: 'Invoice',
  category: 'Sales / Closing',
  priority: 1,
  complexity: 'medium',
  statuses: ['draft', 'sent', 'approved', 'paid', 'cancelled'],
  createDefaultDocument() {
    const document = createBaseDocument('invoice', 'Invoice');
    document.meta.number = 'INV-2026-001';
    document.meta.dueOn = new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
    document.parties.issuer = partyIssuer;
    document.content.summaryHtml = '<p>This invoice covers the agreed services and deliverables.</p>';
    document.content.lineItems = [
      { id: 'invoice_1', description: 'UI/UX design and implementation', quantity: 1, unitPrice: 6500 },
      { id: 'invoice_2', description: 'Project setup and deployment support', quantity: 1, unitPrice: 1800 },
    ];
    document.finance.taxRate = 0;
    document.finance.paymentTermsHtml = '<p>Payment due within 14 days unless otherwise agreed in writing.</p>';
    return document;
  },
  validate(document) {
    const errors = validateSharedDocument(document);
    if (!document?.content?.lineItems?.length) errors.push('Invoice requires at least one line item.');
    return errors;
  },
  buildSections(document) {
    return [
      SectionFactories.createHtmlSection('summary', 'Summary', document.content.summaryHtml),
      SectionFactories.createTableSection(document.content.lineItems),
      SectionFactories.createTotalsSection(document.finance),
      SectionFactories.createHtmlSection('notes', 'Payment Terms', document.finance.paymentTermsHtml),
    ];
  },
};
