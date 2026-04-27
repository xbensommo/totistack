/** @file src/apps/ecommerce/functions/server-actions.js */

async function getDoc(ctx, collection, id, label = 'Record') {
  const ref = ctx.db.collection(collection).doc(id)
  const snap = await ref.get()
  if (!snap.exists) throw new Error(`${label} not found.`)
  return { ref, snap, data: snap.data() || {} }
}

async function createOrderEvent(ctx, order, type, message, payload = {}) {
  await ctx.db.collection('commerceOrderEvents').add({
    storeId: order.storeId || null,
    orderId: order.id || ctx.entityId || null,
    type,
    actorId: ctx.auth.uid,
    message,
    fromStatus: payload.fromStatus || null,
    toStatus: payload.toStatus || null,
    payload,
    metadata: {},
    createdAt: ctx.FieldValue.serverTimestamp(),
    updatedAt: ctx.FieldValue.serverTimestamp(),
    createdBy: ctx.auth.uid,
    updatedBy: ctx.auth.uid,
    isDeleted: false,
  })
}

async function notifyOperators(ctx, payload) {
  return ctx.notify({ recipientRole: 'commerce.manager', ...payload })
}

export const serverActions = [
  {
    id: 'commerce.product.publish',
    label: 'Publish product',
    permission: 'commerce.products.publish',
    entityType: 'commerceProduct',
    input: { required: ['productId'] },
    requiresReason: false,
    async handler(ctx) {
      const { ref, data } = await getDoc(ctx, 'commerceProducts', ctx.input.productId, 'Product')
      if (data.status === 'published') return { productId: ctx.input.productId, status: 'published' }
      await ref.update({ status: 'published', visibility: ctx.input.visibility || 'public', publishedAt: ctx.FieldValue.serverTimestamp(), publishedBy: ctx.auth.uid, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await notifyOperators(ctx, { type: 'commerce.product.published', entityType: 'commerceProduct', entityId: ctx.input.productId, actionUrl: '/app/ecommerce/products', meta: { title: data.title || ctx.input.productId } })
      return { productId: ctx.input.productId, status: 'published' }
    },
  },
  {
    id: 'commerce.product.unpublish',
    label: 'Unpublish product',
    permission: 'commerce.products.publish',
    entityType: 'commerceProduct',
    input: { required: ['productId'] },
    requiresReason: true,
    async handler(ctx) {
      const { ref, data } = await getDoc(ctx, 'commerceProducts', ctx.input.productId, 'Product')
      await ref.update({ status: 'draft', visibility: 'hidden', updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid, metadata: { ...(data.metadata || {}), unpublishReason: ctx.reason } })
      await notifyOperators(ctx, { type: 'commerce.product.unpublished', entityType: 'commerceProduct', entityId: ctx.input.productId, actionUrl: '/app/ecommerce/products', meta: { title: data.title || ctx.input.productId } })
      return { productId: ctx.input.productId, status: 'draft' }
    },
  },
  {
    id: 'commerce.order.cancel',
    label: 'Cancel order',
    permission: 'commerce.orders.cancel',
    entityType: 'commerceOrder',
    input: { required: ['orderId'] },
    requiresReason: true,
    async handler(ctx) {
      const { ref, data } = await getDoc(ctx, 'commerceOrders', ctx.input.orderId, 'Order')
      if (['cancelled', 'delivered'].includes(data.status)) throw new Error('This order cannot be cancelled from its current state.')
      await ref.update({ status: 'cancelled', cancelledAt: ctx.FieldValue.serverTimestamp(), internalNote: ctx.reason, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await createOrderEvent(ctx, { ...data, id: ctx.input.orderId }, 'order.cancelled', 'Order cancelled.', { fromStatus: data.status, toStatus: 'cancelled', reason: ctx.reason })
      await notifyOperators(ctx, { type: 'commerce.order.cancelled', entityType: 'commerceOrder', entityId: ctx.input.orderId, actionUrl: '/app/ecommerce/orders', meta: { orderNumber: data.orderNumber || ctx.input.orderId } })
      return { orderId: ctx.input.orderId, status: 'cancelled' }
    },
  },
  {
    id: 'commerce.payment.confirm',
    label: 'Confirm payment proof',
    permission: 'commerce.payments.confirm',
    entityType: 'commercePaymentProof',
    input: { required: ['paymentProofId'] },
    requiresReason: false,
    async handler(ctx) {
      const proof = await getDoc(ctx, 'commercePaymentProofs', ctx.input.paymentProofId, 'Payment proof')
      const orderId = ctx.input.orderId || proof.data.orderId
      if (!orderId) throw new Error('Payment proof has no linked order.')
      const order = await getDoc(ctx, 'commerceOrders', orderId, 'Order')
      await ctx.db.runTransaction(async (tx) => {
        tx.update(proof.ref, { status: 'confirmed', reviewedBy: ctx.auth.uid, reviewedAt: ctx.FieldValue.serverTimestamp(), updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
        tx.update(order.ref, { paymentStatus: 'paid', status: order.data.status === 'pending' ? 'confirmed' : order.data.status, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      })
      await createOrderEvent(ctx, { ...order.data, id: orderId }, 'payment.confirmed', 'Payment confirmed.', { paymentProofId: ctx.input.paymentProofId })
      await notifyOperators(ctx, { type: 'commerce.payment.confirmed', entityType: 'commercePaymentProof', entityId: ctx.input.paymentProofId, actionUrl: '/app/ecommerce/orders', meta: { orderNumber: order.data.orderNumber || orderId } })
      return { paymentProofId: ctx.input.paymentProofId, orderId, paymentStatus: 'paid' }
    },
  },
  {
    id: 'commerce.payment.reject',
    label: 'Reject payment proof',
    permission: 'commerce.payments.reject',
    entityType: 'commercePaymentProof',
    input: { required: ['paymentProofId'] },
    requiresReason: true,
    async handler(ctx) {
      const proof = await getDoc(ctx, 'commercePaymentProofs', ctx.input.paymentProofId, 'Payment proof')
      const orderId = ctx.input.orderId || proof.data.orderId
      await proof.ref.update({ status: 'rejected', reviewedBy: ctx.auth.uid, reviewedAt: ctx.FieldValue.serverTimestamp(), reviewReason: ctx.reason, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      if (orderId) {
        const order = await getDoc(ctx, 'commerceOrders', orderId, 'Order')
        await order.ref.update({ paymentStatus: 'rejected', updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
        await createOrderEvent(ctx, { ...order.data, id: orderId }, 'payment.rejected', 'Payment proof rejected.', { paymentProofId: ctx.input.paymentProofId, reason: ctx.reason })
      }
      await notifyOperators(ctx, { type: 'commerce.payment.rejected', entityType: 'commercePaymentProof', entityId: ctx.input.paymentProofId, actionUrl: '/app/ecommerce/orders', meta: { orderNumber: orderId || ctx.input.paymentProofId } })
      return { paymentProofId: ctx.input.paymentProofId, orderId, status: 'rejected' }
    },
  },
  {
    id: 'commerce.order.fulfill',
    label: 'Mark order fulfilled',
    permission: 'commerce.orders.fulfill',
    entityType: 'commerceOrder',
    input: { required: ['orderId'] },
    requiresReason: false,
    async handler(ctx) {
      const order = await getDoc(ctx, 'commerceOrders', ctx.input.orderId, 'Order')
      if (order.data.paymentStatus !== 'paid') throw new Error('Only paid orders can be fulfilled.')
      await order.ref.update({ fulfillmentStatus: 'fulfilled', status: 'fulfilled', fulfilledAt: ctx.FieldValue.serverTimestamp(), updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await createOrderEvent(ctx, { ...order.data, id: ctx.input.orderId }, 'order.fulfilled', 'Order fulfilled.', {})
      await notifyOperators(ctx, { type: 'commerce.order.fulfilled', entityType: 'commerceOrder', entityId: ctx.input.orderId, actionUrl: '/app/ecommerce/orders', meta: { orderNumber: order.data.orderNumber || ctx.input.orderId } })
      return { orderId: ctx.input.orderId, fulfillmentStatus: 'fulfilled' }
    },
  },
  {
    id: 'commerce.order.deliver',
    label: 'Mark order delivered',
    permission: 'commerce.orders.deliver',
    entityType: 'commerceOrder',
    input: { required: ['orderId'] },
    requiresReason: false,
    async handler(ctx) {
      const order = await getDoc(ctx, 'commerceOrders', ctx.input.orderId, 'Order')
      if (order.data.fulfillmentStatus !== 'fulfilled') throw new Error('Only fulfilled orders can be delivered.')
      await order.ref.update({ fulfillmentStatus: 'delivered', status: 'delivered', deliveredAt: ctx.FieldValue.serverTimestamp(), updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await createOrderEvent(ctx, { ...order.data, id: ctx.input.orderId }, 'order.delivered', 'Order delivered.', {})
      await notifyOperators(ctx, { type: 'commerce.order.delivered', entityType: 'commerceOrder', entityId: ctx.input.orderId, actionUrl: '/app/ecommerce/orders', meta: { orderNumber: order.data.orderNumber || ctx.input.orderId } })
      return { orderId: ctx.input.orderId, fulfillmentStatus: 'delivered' }
    },
  },
  {
    id: 'commerce.inventory.adjust',
    label: 'Adjust inventory',
    permission: 'commerce.inventory.adjust',
    entityType: 'commerceInventoryMovement',
    input: { required: ['productId', 'quantity'] },
    requiresReason: true,
    async handler(ctx) {
      const product = await getDoc(ctx, 'commerceProducts', ctx.input.productId, 'Product')
      const previousQuantity = Number(product.data.stockQuantity || 0)
      const delta = Number(ctx.input.quantity || 0)
      if (!Number.isFinite(delta) || delta === 0) throw new Error('quantity must be a non-zero number.')
      const nextQuantity = previousQuantity + delta
      if (nextQuantity < 0) throw new Error('Inventory cannot be adjusted below zero.')
      const movementRef = ctx.db.collection('commerceInventoryMovements').doc()
      await ctx.db.runTransaction(async (tx) => {
        tx.update(product.ref, { stockQuantity: nextQuantity, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
        tx.set(movementRef, {
          storeId: product.data.storeId || null,
          productId: ctx.input.productId,
          variantId: ctx.input.variantId || null,
          movementType: 'adjustment',
          quantity: delta,
          previousQuantity,
          nextQuantity,
          reason: ctx.reason,
          referenceType: 'manual',
          referenceId: ctx.operationId || null,
          actorId: ctx.auth.uid,
          metadata: ctx.input.metadata || {},
          createdAt: ctx.FieldValue.serverTimestamp(),
          updatedAt: ctx.FieldValue.serverTimestamp(),
          createdBy: ctx.auth.uid,
          updatedBy: ctx.auth.uid,
          isDeleted: false,
        })
      })
      await notifyOperators(ctx, { type: 'commerce.inventory.adjusted', entityType: 'commerceInventoryMovement', entityId: movementRef.id, actionUrl: '/app/ecommerce/inventory', meta: { productId: ctx.input.productId } })
      return { movementId: movementRef.id, productId: ctx.input.productId, previousQuantity, nextQuantity }
    },
  },
  {
    id: 'commerce.return.approve',
    label: 'Approve return',
    permission: 'commerce.returns.approve',
    entityType: 'commerceReturn',
    input: { required: ['returnId'] },
    requiresReason: false,
    async handler(ctx) {
      const record = await getDoc(ctx, 'commerceReturns', ctx.input.returnId, 'Return')
      if (record.data.status !== 'pending') throw new Error('Only pending returns can be approved.')
      await record.ref.update({ status: 'approved', approvedAmount: Number(ctx.input.approvedAmount ?? record.data.requestedAmount ?? 0), decidedBy: ctx.auth.uid, decidedAt: ctx.FieldValue.serverTimestamp(), updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await notifyOperators(ctx, { type: 'commerce.return.approved', entityType: 'commerceReturn', entityId: ctx.input.returnId, actionUrl: '/app/ecommerce/returns', meta: { orderId: record.data.orderId || ctx.input.returnId } })
      return { returnId: ctx.input.returnId, status: 'approved' }
    },
  },
  {
    id: 'commerce.return.reject',
    label: 'Reject return',
    permission: 'commerce.returns.reject',
    entityType: 'commerceReturn',
    input: { required: ['returnId'] },
    requiresReason: true,
    async handler(ctx) {
      const record = await getDoc(ctx, 'commerceReturns', ctx.input.returnId, 'Return')
      if (record.data.status !== 'pending') throw new Error('Only pending returns can be rejected.')
      await record.ref.update({ status: 'rejected', decisionReason: ctx.reason, decidedBy: ctx.auth.uid, decidedAt: ctx.FieldValue.serverTimestamp(), updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await notifyOperators(ctx, { type: 'commerce.return.rejected', entityType: 'commerceReturn', entityId: ctx.input.returnId, actionUrl: '/app/ecommerce/returns', meta: { orderId: record.data.orderId || ctx.input.returnId } })
      return { returnId: ctx.input.returnId, status: 'rejected' }
    },
  },
]

export default serverActions
