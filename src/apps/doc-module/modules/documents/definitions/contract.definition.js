import { createBaseDocument } from '../core/createBaseDocument.js';
import { SectionFactories } from '../core/buildRenderSections.js';
import { validateSharedDocument } from '../core/validators.js';
import { partyIssuer }  from '../config/Issuer.js';
export const contractDefinition = {
  id: 'contract',
  label: 'Contract / Service Agreement',
  category: 'Project Delivery',
  priority: 2,
  complexity: 'high',
  statuses: ['draft', 'sent', 'approved', 'signed', 'active', 'completed', 'cancelled'],
  createDefaultDocument() {
    const document = createBaseDocument('contract', 'Contract / Service Agreement');
    document.meta.number = 'AGR-2026-001';
    document.parties.issuer = partyIssuer;
    document.workflow.requiresClientSignature = true;
    document.brand.legalLine = 'Digital systems, web infrastructure, automation, and managed support.';
    document.content.summaryHtml = '<p>This agreement defines the scope, commercial terms, responsibilities, and signatures for the service relationship between Totisoft and the client.</p>';
    document.content.richBlocks = [
      { id: 'contract_intro', label: 'Purpose', html: '<h2>Purpose</h2><p>This agreement governs the provision of digital systems, implementation, and support services.</p>' },
      { id: 'contract_term', label: 'Term', html: '<h2>Term</h2><p>This agreement starts on the effective date and remains active until completion, renewal, or lawful termination.</p>' },
      { id: 'contract_payment', label: 'Fees & Payment', html: '<h2>Fees & Payment</h2><p>Fees are payable according to the approved commercial schedule and any attached invoice.</p>' },
      { id: 'contract_confidentiality', label: 'Confidentiality', html: '<h2>Confidentiality</h2><p>Both parties shall protect confidential information and use it only for delivery of the agreed services.</p>' },
    ];
    document.signatures.issuer.name = 'Sommo B. Petrus';
    document.signatures.issuer.title = 'Owner / Lead Systems Developer';
    return document;
  },
  validate(document) {
    const errors = validateSharedDocument(document);
    if (!document?.content?.richBlocks?.length) errors.push('Contract requires at least one clause block.');
    return errors;
  },
  buildSections(document) {
    return [
      SectionFactories.createHtmlSection('summary', 'Agreement Summary', document.content.summaryHtml),
      ...document.content.richBlocks.map((block) => SectionFactories.createHtmlSection('rich-text', block.label, block.html, { keepWithNext: false })),
      document.content.notesHtml
        ? SectionFactories.createHtmlSection('notes', 'Additional Notes', document.content.notesHtml)
        : null,
    ].filter(Boolean);
  },
};
