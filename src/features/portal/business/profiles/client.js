/** @file src/features/portal/business/profiles/client.js */

const clientPortalProfile = {
  key: 'client',
  name: 'Client Portal',
  audienceLabel: 'Client',
  defaultMembershipRole: 'client',
  sections: [
    { key: 'dashboard', label: 'Overview' },
    { key: 'workspace', label: 'Projects' },
    { key: 'documents', label: 'Documents' },
    { key: 'billing', label: 'Invoices' },
    { key: 'support', label: 'Support' },
    { key: 'settings', label: 'Settings' },
  ],
  dashboardWidgets: ['summary', 'milestones', 'documents', 'billing', 'support'],
  collectionAliases: {
    records: ['clients', 'crm_opportunities', 'crm_leads'],
    documents: ['crm_documents', 'documents'],
    billing: ['transactions', 'finance_transactions'],
    orders: ['orders'],
    bookings: ['bookings'],
  },
  visibleRecordTypes: ['client', 'project', 'proposal', 'milestone'],
  actionDefinitions: {
    requestSupport: {
      label: 'Request support',
      permission: 'portal.support.create',
      confirm: null,
      fields: ['subject', 'message', 'priority'],
    },
    approveMilestone: {
      label: 'Approve milestone',
      permission: 'portal.self.manage',
      confirm: 'Approve this milestone and notify the team?',
      fields: ['recordId', 'note'],
    },
    requestMeeting: {
      label: 'Request meeting',
      permission: 'portal.self.manage',
      confirm: null,
      fields: ['message', 'preferredDate'],
    },
  },
}

export default clientPortalProfile
