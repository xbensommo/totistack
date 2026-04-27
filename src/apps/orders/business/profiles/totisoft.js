/**
 * @file orders/business/profiles/totisoft.js
 * @description Totisoft service-order profile.
 */

import genericProfile from './generic.js'

export default Object.freeze({
  ...genericProfile,
  code: 'totisoft',
  name: 'Totisoft Orders',
  description: 'Service-order workflow for proposals, setup work, retainers, and managed care.',
  labels: {
    ...genericProfile.labels,
    singular: 'Service Order',
    plural: 'Service Orders',
    customer: 'Client',
    assignee: 'Consultant',
  },
  defaults: {
    ...genericProfile.defaults,
    currency: 'NAD',
    orderType: 'service',
    fulfillmentType: 'project',
  },
  stages: [
    'pending',
    'qualified',
    'approved',
    'in_setup',
    'delivered',
    'managed_care',
    'cancelled',
    'refunded',
  ],
})
