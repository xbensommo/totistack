/** @file src/apps/orders/order.actions.js */

function getOrderService(context) {
  const service = context?.service || context?.services?.orders || context?.services?.orderService
  if (!service) throw new Error('Order service is not configured for this action.')
  return service
}

function orderId(context) {
  return context?.target?.id || context?.id || context?.orderId
}

export function createOrderActionDefinitions() {
  return [
    {
      type: 'orders.update',
      confirm: ({ target }) => ({
        title: 'Update order',
        message: `Update ${target?.orderNumber || 'this order'}?`,
        confirmText: 'Update order',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getOrderService(context).patch(orderId(context), context.payload || {}),
    },
    {
      type: 'orders.update-status',
      confirm: ({ target, payload }) => ({
        title: 'Change order status',
        message: `Change ${target?.orderNumber || 'this order'} to ${payload?.status || 'the selected status'}?`,
        confirmText: 'Change status',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getOrderService(context).updateStatus(orderId(context), context.payload?.status, context.payload || {}),
    },
    {
      type: 'orders.assign',
      confirm: ({ target, payload }) => ({
        title: 'Assign order',
        message: `Assign ${target?.orderNumber || 'this order'} to ${payload?.assignedTo || 'the selected user'}?`,
        confirmText: 'Assign order',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getOrderService(context).assignOrder(orderId(context), context.payload || {}),
    },
    {
      type: 'orders.mark-paid',
      confirm: ({ target }) => ({
        title: 'Mark order paid',
        message: `Mark ${target?.orderNumber || 'this order'} as paid?`,
        confirmText: 'Mark paid',
        cancelText: 'Cancel',
        variant: 'success',
      }),
      run: (context) => getOrderService(context).markPaid(orderId(context), context.payload || {}),
    },
    {
      type: 'orders.cancel',
      confirm: ({ target }) => ({
        title: 'Cancel order',
        message: `Cancel ${target?.orderNumber || 'this order'}?`,
        confirmText: 'Cancel order',
        cancelText: 'Keep order',
        variant: 'danger',
      }),
      run: (context) => getOrderService(context).cancelOrder(orderId(context)),
    },
    {
      type: 'orders.ship',
      confirm: ({ target }) => ({
        title: 'Ship order',
        message: `Mark ${target?.orderNumber || 'this order'} as shipped?`,
        confirmText: 'Ship order',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getOrderService(context).shipOrder(orderId(context), context.payload || {}),
    },
    {
      type: 'orders.deliver',
      confirm: ({ target }) => ({
        title: 'Deliver order',
        message: `Mark ${target?.orderNumber || 'this order'} as delivered/closed?`,
        confirmText: 'Deliver order',
        cancelText: 'Cancel',
        variant: 'success',
      }),
      run: (context) => getOrderService(context).deliverOrder(orderId(context)),
    },
    {
      type: 'orders.refund',
      confirm: ({ target, payload }) => ({
        title: 'Refund order',
        message: `Refund ${target?.orderNumber || 'this order'}${payload?.amount ? ` for ${payload.amount}` : ''}?`,
        confirmText: 'Process refund',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getOrderService(context).refund(orderId(context), context.payload || {}),
    },
  ]
}

export default createOrderActionDefinitions
