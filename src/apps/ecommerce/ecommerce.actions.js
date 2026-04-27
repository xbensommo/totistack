/** @file src/apps/ecommerce/ecommerce.actions.js */
import { ECOMMERCE_PERMISSIONS } from './permissions.js'

const decision = (id, label, permission, entityType, overrides = {}) => ({
  id,
  label,
  decision: true,
  execution: 'server',
  callable: 'serverActionRun',
  permission,
  entityType,
  requiresReason: false,
  tone: 'primary',
  confirmTitle: `${label}?`,
  confirmMessage: 'This operation changes business state and will be audited.',
  ...overrides,
})

export const ecommerceActionDefinitions = Object.freeze([
  decision('commerce.product.publish', 'Publish product', ECOMMERCE_PERMISSIONS.PRODUCTS_PUBLISH, 'commerceProduct'),
  decision('commerce.product.unpublish', 'Unpublish product', ECOMMERCE_PERMISSIONS.PRODUCTS_PUBLISH, 'commerceProduct', { requiresReason: true, tone: 'warning' }),
  decision('commerce.order.cancel', 'Cancel order', ECOMMERCE_PERMISSIONS.ORDERS_CANCEL, 'commerceOrder', { requiresReason: true, tone: 'danger' }),
  decision('commerce.payment.confirm', 'Confirm payment', ECOMMERCE_PERMISSIONS.PAYMENTS_CONFIRM, 'commercePaymentProof', { tone: 'success' }),
  decision('commerce.payment.reject', 'Reject payment', ECOMMERCE_PERMISSIONS.PAYMENTS_REJECT, 'commercePaymentProof', { requiresReason: true, tone: 'danger' }),
  decision('commerce.order.fulfill', 'Mark fulfilled', ECOMMERCE_PERMISSIONS.ORDERS_FULFILL, 'commerceOrder'),
  decision('commerce.order.deliver', 'Mark delivered', ECOMMERCE_PERMISSIONS.ORDERS_DELIVER, 'commerceOrder', { tone: 'success' }),
  decision('commerce.inventory.adjust', 'Adjust stock', ECOMMERCE_PERMISSIONS.INVENTORY_ADJUST, 'commerceInventoryMovement', { requiresReason: true, tone: 'warning' }),
  decision('commerce.return.approve', 'Approve return', ECOMMERCE_PERMISSIONS.RETURNS_APPROVE, 'commerceReturn', { tone: 'success' }),
  decision('commerce.return.reject', 'Reject return', ECOMMERCE_PERMISSIONS.RETURNS_REJECT, 'commerceReturn', { requiresReason: true, tone: 'danger' }),
])

export function createEcommerceActionDefinitions() {
  return ecommerceActionDefinitions
}

export default ecommerceActionDefinitions
