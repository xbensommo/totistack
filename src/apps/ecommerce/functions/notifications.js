/** @file src/apps/ecommerce/functions/notifications.js */
export const notificationDefinitions = [
  { type: 'commerce.product.published', title: 'Product published', message: '{{meta.title}} is now published.', entityType: 'commerceProduct', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.product.unpublished', title: 'Product unpublished', message: '{{meta.title}} was unpublished.', entityType: 'commerceProduct', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.order.cancelled', title: 'Order cancelled', message: 'Order {{meta.orderNumber}} was cancelled.', entityType: 'commerceOrder', priority: 'high', delivery: { push: true } },
  { type: 'commerce.payment.confirmed', title: 'Payment confirmed', message: 'Payment for order {{meta.orderNumber}} was confirmed.', entityType: 'commercePaymentProof', priority: 'high', delivery: { push: true } },
  { type: 'commerce.payment.rejected', title: 'Payment rejected', message: 'Payment proof for order {{meta.orderNumber}} was rejected.', entityType: 'commercePaymentProof', priority: 'high', delivery: { push: true } },
  { type: 'commerce.order.fulfilled', title: 'Order fulfilled', message: 'Order {{meta.orderNumber}} was marked as fulfilled.', entityType: 'commerceOrder', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.order.delivered', title: 'Order delivered', message: 'Order {{meta.orderNumber}} was delivered.', entityType: 'commerceOrder', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.inventory.adjusted', title: 'Inventory adjusted', message: 'Inventory was adjusted for {{meta.productId}}.', entityType: 'commerceInventoryMovement', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.return.approved', title: 'Return approved', message: 'A return for order {{meta.orderId}} was approved.', entityType: 'commerceReturn', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.return.rejected', title: 'Return rejected', message: 'A return for order {{meta.orderId}} was rejected.', entityType: 'commerceReturn', priority: 'normal', delivery: { push: true } },
  { type: 'commerce.inventory.low_stock', title: 'Low stock', message: '{{meta.title}} is at or below the low-stock threshold.', entityType: 'commerceProduct', priority: 'high', delivery: { push: true } },
]

export default notificationDefinitions
