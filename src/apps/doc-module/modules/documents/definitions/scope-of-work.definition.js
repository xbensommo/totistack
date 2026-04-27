import { createBaseDocument } from '../core/createBaseDocument.js';
import { SectionFactories } from '../core/buildRenderSections.js';
import { validateSharedDocument } from '../core/validators.js';
import { partyIssuer }  from '../config/Issuer.js';

export const scopeOfWorkDefinition = {
  id: 'scope_of_work',
  label: 'Scope of Work',
  category: 'Project Delivery',
  priority: 2,
  complexity: 'high',
  statuses: ['draft', 'sent', 'approved', 'signed', 'active', 'completed'],
  createDefaultDocument() {
    const document = createBaseDocument('scope_of_work', 'Scope of Work');
    document.meta.number = 'SOW-2026-001';
    document.workflow.approvalRequired = true;
    document.parties.issuer = partyIssuer;
    document.content.summaryHtml = '<p>This scope of work describes the agreed deliverables, inclusions, exclusions, assumptions, and milestones for the project.</p>';
    document.content.scopeItems = [
      { id: 'sow_1', label: 'Deliverable 1', value: 'Discovery and solution architecture' },
      { id: 'sow_2', label: 'Deliverable 2', value: 'Implementation of the core business workflow' },
      { id: 'sow_3', label: 'Deliverable 3', value: 'User acceptance support and deployment handover' },
    ];
    document.content.milestones = [
      { id: 'milestone_1', label: 'Phase 1', value: 'Requirements and architecture approval' },
      { id: 'milestone_2', label: 'Phase 2', value: 'Core implementation complete' },
      { id: 'milestone_3', label: 'Phase 3', value: 'Testing, launch, and handover' },
    ];
    document.content.notesHtml = '<p>Items not explicitly listed in this scope are excluded unless approved through a formal change request.</p>';
    return document;
  },
  validate(document) {
    const errors = validateSharedDocument(document);
    if (!document?.content?.scopeItems?.length) errors.push('Scope of Work requires at least one scope item.');
    return errors;
  },
  buildSections(document) {
    return [
      SectionFactories.createHtmlSection('summary', 'Scope Summary', document.content.summaryHtml),
      SectionFactories.createListSection('list', 'Deliverables', document.content.scopeItems),
      SectionFactories.createListSection('list', 'Milestones', document.content.milestones),
      SectionFactories.createHtmlSection('notes', 'Exclusions & Notes', document.content.notesHtml),
    ];
  },
};
