/**
 * @file orders/business/profiles/eduprolic.js
 * @description Eduprolic assignment-order profile.
 */

import genericProfile from './generic.js'

export default Object.freeze({
  ...genericProfile,
  code: 'eduprolic',
  name: 'Eduprolic Orders',
  description: 'Assignment and education-services workflow with consultant ownership and payout awareness.',
  labels: {
    ...genericProfile.labels,
    singular: 'Assignment Order',
    plural: 'Assignment Orders',
    customer: 'Student Client',
    assignee: 'Consultant / Writer',
  },
  defaults: {
    ...genericProfile.defaults,
    currency: 'NAD',
    orderType: 'assignment',
    fulfillmentType: 'delivery',
  },
  stages: [
    'pending',
    'assigned',
    'accepted',
    'in_progress',
    'submitted',
    'paid',
    'closed',
    'cancelled',
    'refunded',
  ],
})
