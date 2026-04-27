// definitions/software-development-contract.definition.js
import { createBaseDocument } from '../core/createBaseDocument.js';
import { SectionFactories } from '../core/buildRenderSections.js';
import { validateSharedDocument } from '../core/validators.js';
import { partyIssuer }  from '../config/Issuer.js';

export const softwareDevelopmentContractDefinition = {
  id: 'software-development-contract',
  label: 'Software / Website Development Contract',
  category: 'Project Delivery',
  priority: 1,
  complexity: 'high',
  statuses: ['draft', 'sent', 'approved', 'signed', 'active', 'completed', 'cancelled'],

  createDefaultDocument() {
    const document = createBaseDocument(
      'software-development-contract',
      'Software / Website Development Contract'
    );

    document.parties.issuer = partyIssuer;

    document.meta.number = 'SDC-2026-001';
    document.workflow.requiresClientSignature = true;

    document.content.summaryHtml =
      '<p>This agreement covers the design, development, testing, launch, and support of a software or website solution.</p>';

    document.content.richBlocks = [
      {
        id: 'scope',
        label: 'Scope of Work',
        html: '<h2>Scope of Work</h2><p>Totisoft will design and develop the agreed website or software solution based on approved requirements.</p>',
      },
      {
        id: 'timeline',
        label: 'Timeline',
        html: '<h2>Timeline</h2><p>Delivery timelines depend on approvals, content submission, and project complexity.</p>',
      },
      {
        id: 'payment',
        label: 'Commercial Terms',
        html: '<h2>Commercial Terms</h2><p>Fees are payable according to the approved quotation, invoice, or milestone schedule.</p>',
      },
      {
        id: 'ip',
        label: 'Intellectual Property',
        html: '<h2>Intellectual Property</h2><p>Ownership and usage rights transfer according to the agreed payment and delivery terms.</p>',
      },
      {
        id: 'support',
        label: 'Support & Maintenance',
        html: '<h2>Support & Maintenance</h2><p>Ongoing support is governed by the selected maintenance or hosting agreement.</p>',
      },
    ];

    return document;
  },

  validate(document) {
    const errors = validateSharedDocument(document);

    if (!document?.content?.richBlocks?.length) {
      errors.push('Software development contract requires clause blocks.');
    }

    if (!document?.workflow?.requiresClientSignature) {
      errors.push('Client signature should be required for this contract.');
    }

    return errors;
  },

  buildSections(document) {
    return [
      SectionFactories.createHtmlSection(
        'summary',
        'Agreement Summary',
        document.content.summaryHtml
      ),
      ...document.content.richBlocks.map((block) =>
        SectionFactories.createHtmlSection('rich-text', block.label, block.html)
      ),
      document.content.notesHtml
        ? SectionFactories.createHtmlSection('notes', 'Additional Notes', document.content.notesHtml)
        : null,
    ].filter(Boolean);
  },
};