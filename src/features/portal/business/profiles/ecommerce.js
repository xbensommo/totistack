/** @file src/features/portal/business/profiles/ecommerce.js */

const ecommercePortalProfile = {
  key: 'ecommerce',
  name: 'Customer Portal',
  audienceLabel: 'Customer',
  defaultMembershipRole: 'customer',
  sections: [
    { key: 'dashboard', label: 'Overview' },
    { key: 'workspace', label: 'Orders' },
    { key: 'documents', label: 'Receipts & Files' },
    { key: 'billing', label: 'Payments' },
    { key: 'support', label: 'Support' },
    { key: 'settings', label: 'Settings' },
  ],
  dashboardWidgets: ['summary', 'orders', 'documents', 'billing', 'support'],
  collectionAliases: {
    records: ['orders', 'clients'],
    documents: ['documents', 'crm_documents'],
    billing: ['transactions', 'finance_transactions'],
    orders: ['orders'],
    bookings: [],
  },
  visibleRecordTypes: ['order', 'customer', 'return_request'],
  actionDefinitions: {
    requestSupport: {
      label: 'Request support',
      permission: 'portal.support.create',
      confirm: null,
      fields: ['subject', 'message', 'priority'],
    },
    confirmOrderReceipt: {
      label: 'Confirm delivery',
      permission: 'portal.orders.view',
      confirm: 'Confirm that you received this order?',
      fields: ['orderId', 'note'],
    },
    requestReturn: {
      label: 'Request return',
      permission: 'portal.orders.view',
      confirm: 'Create a return request for this order?',
      fields: ['orderId', 'message'],
    },
  },
}

export default ecommercePortalProfile
