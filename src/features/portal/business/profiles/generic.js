/** @file src/features/portal/business/profiles/generic.js */

const genericPortalProfile = {
  key: 'generic',
  name: 'Generic Portal',
  audienceLabel: 'Portal User',
  defaultMembershipRole: 'customer',
  sections: [
    { key: 'dashboard', label: 'Overview' },
    { key: 'workspace', label: 'My Workspace' },
    { key: 'documents', label: 'Documents' },
    { key: 'billing', label: 'Billing' },
    { key: 'support', label: 'Support' },
    { key: 'settings', label: 'Settings' },
  ],
  dashboardWidgets: ['summary', 'recent_activity', 'documents', 'billing', 'support'],
  collectionAliases: {
    records: ['clients', 'student_records', 'crm_opportunities', 'crm_leads'],
    documents: ['crm_documents', 'documents'],
    billing: ['transactions', 'finance_transactions'],
    orders: ['orders'],
    bookings: ['bookings'],
  },
  visibleRecordTypes: ['client', 'student', 'customer', 'project', 'order'],
  actionDefinitions: {
    requestSupport: {
      label: 'Request support',
      permission: 'portal.support.create',
      confirm: null,
      fields: ['subject', 'message', 'priority'],
    },
    requestDocumentReview: {
      label: 'Request document review',
      permission: 'portal.self.manage',
      confirm: 'Send a review request to the internal team?',
      fields: ['documentId', 'note'],
    },
    requestBillingHelp: {
      label: 'Ask billing question',
      permission: 'portal.billing.view',
      confirm: null,
      fields: ['invoiceId', 'message'],
    },
  },
}

export default genericPortalProfile
