import { createBaseDocument } from '../core/createBaseDocument.js';
import { SectionFactories } from '../core/buildRenderSections.js';
import { validateSharedDocument } from '../core/validators.js';
import { partyIssuer }  from '../config/Issuer.js';
export const hostingAgreementDefinition = {
  id: 'hosting_agreement',
  label: 'Hosting / Service Agreement',
  category: 'Operations / Support',
  priority: 2,
  complexity: 'high',
  statuses: ['draft', 'sent', 'approved', 'signed', 'active', 'cancelled'],
  createDefaultDocument() {
    const document = createBaseDocument('hosting_agreement', 'Hosting / Service Agreement');
    document.meta.number = 'HST-2026-001';
    document.workflow.requiresClientSignature = true;
    document.parties.issuer = partyIssuer;
    document.content.summaryHtml = '<p>This agreement defines hosting scope, support responsibilities, service levels, billing cycle, backups, and termination conditions.</p>';
    document.content.richBlocks = [
      { id: 'hosting_scope', label: 'Service Scope', html: '<h2>Service Scope</h2><p>Managed hosting, uptime monitoring, routine maintenance, and operational support are included as listed in this agreement.</p>' },
      { id: 'hosting_backups', label: 'Backups', html: '<h2>Backups</h2><p>Application and data backups are performed on the agreed schedule and retained according to the service plan.</p>' },
      { id: 'hosting_support', label: 'Support Window', html: '<h2>Support Window</h2><p>Support is delivered during business hours unless an enhanced service plan has been approved.</p>' },
      { id: 'hosting_billing', label: 'Billing Cycle', html: '<h2>Billing Cycle</h2><p>Hosting fees are billed monthly in advance and may be suspended for non-payment after notice.</p>' },
    ];
    document.content.notesHtml = '<p>Third-party services, domain renewals, premium email platforms, and emergency work outside scope may be billed separately.</p>';
    return document;
  },
  validate(document) {
    const errors = validateSharedDocument(document);
    if (!document?.content?.richBlocks?.length) errors.push('Hosting Agreement requires at least one clause block.');
    return errors;
  },
  buildSections(document) {
    return [
      SectionFactories.createHtmlSection('summary', 'Service Summary', document.content.summaryHtml),
      ...document.content.richBlocks.map((block) => SectionFactories.createHtmlSection('rich-text', block.label, block.html)),
      SectionFactories.createHtmlSection('notes', 'Operational Notes', document.content.notesHtml),
    ];
  },
};
