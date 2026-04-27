/**
 * @file src/apps/ecommerce/services/returns.service.js
 * @description Returns and refunds service.
 */

import { commitCollectionUpdate, requireEntityId } from './ecommerce-core-actions.js'

/**
 * @param {{ returnsCollection?: any, actionModal?: { requestEcommerceAction: Function }, notificationService?: any, now?: () => Date }} deps
 */
export function createReturnsService(deps = {}) {
  const { returnsCollection, actionModal, notificationService, now = () => new Date() } = deps

  return {
    /**
     * @param {{ items?: Array<{ quantity?: number, unitPrice?: number }> }} request
     */
    computeRefundAmount(request = {}) {
      return Number(
        (request.items || []).reduce((sum, item) => {
          return sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0))
        }, 0).toFixed(2),
      )
    },

    /**
     * @param {Record<string, any>} returnRequest
     * @param {{ actorId?: string }} [options]
     */
    async approveReturn(returnRequest, options = {}) {
      const returnId = requireEntityId(returnRequest, 'return request')

      const decision = await actionModal?.requestEcommerceAction?.({
        intent: 'approve-return',
        title: 'Approve return',
        message: 'Approve this return request and move it to refund workflow?',
        confirmLabel: 'Approve return',
        tone: 'warning',
        meta: { returnId },
      })

      if (!decision?.confirmed) {
        return { ok: false, skipped: true, reason: decision?.reason || 'cancelled' }
      }

      const payload = {
        ...returnRequest,
        status: 'approved',
        approvedAt: now().toISOString(),
        updatedAt: now().toISOString(),
        updatedBy: options.actorId || null,
      }

      if (returnsCollection?.actions) {
        await commitCollectionUpdate(returnsCollection.actions, returnId, payload)
      }

      if (notificationService?.isConfigured?.()) {
        await notificationService.emitReturnApproved({ returnRequest: payload, actorId: options.actorId || null })
      }

      return { ok: true, returnRequest: payload }
    },
  }
}
