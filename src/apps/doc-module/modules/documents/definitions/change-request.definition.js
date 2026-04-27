import { createBaseDocument } from '../core/createBaseDocument.js';
import { SectionFactories } from '../core/buildRenderSections.js';
import { validateSharedDocument } from '../core/validators.js';
import { partyIssuer }  from '../config/Issuer.js';
export const changeRequestDefinition = {
  id: 'change_request',
  label: 'Change Request',
  category: 'Client Onboarding',
  priority: 2,
  complexity: 'high',
  statuses: ['draft', 'sent', 'approved', 'signed', 'cancelled'],
  createDefaultDocument() {
    const document = createBaseDocument('change_request', 'Change Request');
    document.meta.number = 'CR-2026-001';
    document.workflow.approvalRequired = true;
    document.workflow.requiresClientSignature = true;
    document.parties.issuer = partyIssuer;
    document.content.summaryHtml = '<p>This change request captures the requested change, the reason for the request, and the impact on scope, timeline, and budget.</p>';
    document.content.changeItems = [
      { id: 'change_1', label: 'Requested Change', value: 'Add an operations dashboard and reporting widgets.' },
      { id: 'change_2', label: 'Business Reason', value: 'Management requires live visibility into daily activity and exceptions.' },
      { id: 'change_3', label: 'Schedule Impact', value: '+ 7 working days' },
      { id: 'change_4', label: 'Cost Impact', value: '+ N$4,500.00' },
    ];
    document.content.notesHtml = '<p>This request becomes active only after written approval and signature by the authorized client representative.</p>';
    return document;
  },
  validate(document) {
    const errors = validateSharedDocument(document);
    if (!document?.content?.changeItems?.length) errors.push('Change Request requires at least one change impact item.');
    return errors;
  },
  buildSections(document) {
    return [
      SectionFactories.createHtmlSection('summary', 'Change Summary', document.content.summaryHtml),
      SectionFactories.createListSection('list', 'Change Details', document.content.changeItems),
      SectionFactories.createHtmlSection('notes', 'Approval Notes', document.content.notesHtml),
    ];
  },
};
