/** @file src/apps/ecommerce/functions/firestore-triggers.js */
import { createNotification } from '../../notifications/createNotification.js'

export const firestoreTriggers = [
  {
    name: 'commerceLowStockNotification',
    event: 'updated',
    document: 'commerceProducts/{productId}',
    async handler(event) {
      const before = event.data?.before?.data?.() || {}
      const after = event.data?.after?.data?.() || {}
      if (!after.trackInventory) return

      const threshold = Number(after.lowStockThreshold || 0)
      if (threshold <= 0) return

      const previous = Number(before.stockQuantity || 0)
      const current = Number(after.stockQuantity || 0)

      if (current > threshold || previous <= threshold) return

      await createNotification({
        recipientRole: 'commerce.inventory_manager',
        type: 'commerce.inventory.low_stock',
        entityType: 'commerceProduct',
        entityId: event.params.productId,
        actionUrl: '/app/ecommerce/inventory',
        priority: 'high',
        createdBy: 'system',
        meta: {
          title: after.title || event.params.productId,
          productId: event.params.productId,
          stockQuantity: current,
        },
      })
    },
  },
]

export default firestoreTriggers
