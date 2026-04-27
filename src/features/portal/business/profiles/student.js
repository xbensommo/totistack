/** @file src/features/portal/business/profiles/student.js */

const studentPortalProfile = {
  key: 'student',
  name: 'Student Portal',
  audienceLabel: 'Student',
  defaultMembershipRole: 'student',
  sections: [
    { key: 'dashboard', label: 'Overview' },
    { key: 'workspace', label: 'My Work' },
    { key: 'documents', label: 'Submissions & Files' },
    { key: 'billing', label: 'Payments' },
    { key: 'support', label: 'Academic Support' },
    { key: 'settings', label: 'Settings' },
  ],
  dashboardWidgets: ['summary', 'deadlines', 'documents', 'billing', 'support'],
  collectionAliases: {
    records: ['student_records', 'crm_opportunities', 'clients'],
    documents: ['crm_documents', 'documents'],
    billing: ['transactions', 'finance_transactions'],
    orders: ['orders'],
    bookings: ['bookings'],
  },
  visibleRecordTypes: ['student', 'assignment', 'service_request'],
  actionDefinitions: {
    requestSupport: {
      label: 'Request support',
      permission: 'portal.support.create',
      confirm: null,
      fields: ['subject', 'message', 'priority'],
    },
    uploadFinalRequirements: {
      label: 'Submit requirements',
      permission: 'portal.self.manage',
      confirm: 'Submit these requirements for internal review?',
      fields: ['note'],
    },
    requestDeadlineClarification: {
      label: 'Ask about deadline',
      permission: 'portal.self.manage',
      confirm: null,
      fields: ['recordId', 'message'],
    },
  },
}

export default studentPortalProfile
