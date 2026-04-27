/** @file src/modules/documents/stores/documents.state.js */
export const documentsState = {
  documents: { value: { items: [], lastVisible: null, hasMore: true, activeFilters: {}, aggregatedCount: 0 }, loading: false, error: null },
  document_audit_logs: { value: { items: [], lastVisible: null, hasMore: true, activeFilters: {}, aggregatedCount: 0 }, loading: false, error: null },
  document_templates: { value: { items: [], lastVisible: null, hasMore: true, activeFilters: {}, aggregatedCount: 0 }, loading: false, error: null },
};
