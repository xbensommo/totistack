/**
 * @file src/apps/ecommerce/services/finance-sync.service.js
 * @description Finance handoff and reconciliation helpers for ecommerce payments.
 */

import { createCollectionRecord } from './ecommerce-core-actions.js'

/**
 * @param {{
 *   financeTransactionsCollection?: any,
 *   financeReconciliationsCollection?: any,
 *   now?: () => Date,
 * }} deps
 */
export function createFinanceSyncService(deps = {}) {
  const {
    financeTransactionsCollection,
    financeReconciliationsCollection,
    now = () => new Date(),
  } = deps

  return {
    /**
     * @returns {string | null}
     */
    resolveFinanceTargetName() {
      return financeTransactionsCollection?.name || null
    },

    /**
     * @returns {boolean}
     */
    isConfigured() {
      return Boolean(financeTransactionsCollection?.actions || financeReconciliationsCollection?.actions)
    },

    /**
     * @param {{ paymentTransaction?: any, order?: any, actorId?: string, financeReference?: string }} input
     * @returns {Record<string, any>}
     */
    buildFinanceEntry(input = {}) {
      const paymentTransaction = input.paymentTransaction || {}
      const order = input.order || {}

      return {
        sourceApp: 'ecommerce',
        sourceType: 'payment_transaction',
        sourceId: paymentTransaction.id || paymentTransaction.orderId || null,
        orderId: order.id || paymentTransaction.orderId || null,
        orderNumber: order.orderNumber || paymentTransaction.orderNumber || null,
        entryType: 'income',
        amount: Number(Number(paymentTransaction.amount || order?.totalsSnapshot?.grandTotal || 0).toFixed(2)),
        currency: paymentTransaction.currency || order.currency || 'NAD',
        method: paymentTransaction.method || order.paymentMethod || null,
        status: 'posted',
        externalReference: input.financeReference || paymentTransaction.externalReference || null,
        description: `Ecommerce payment for order ${order.orderNumber || paymentTransaction.orderNumber || 'unknown'}`,
        postedAt: now().toISOString(),
        createdAt: now().toISOString(),
        createdBy: input.actorId || null,
      }
    },

    /**
     * @param {{ paymentTransaction?: any, order?: any, actorId?: string, financeReference?: string }} input
     */
    async createFinanceEntry(input = {}) {
      const payload = this.buildFinanceEntry(input)

      if (!financeTransactionsCollection?.actions) {
        return {
          skipped: true,
          targetName: this.resolveFinanceTargetName(),
          entry: payload,
        }
      }

      const persisted = await createCollectionRecord(financeTransactionsCollection.actions, payload)

      return {
        skipped: false,
        targetName: this.resolveFinanceTargetName(),
        entry: {
          ...payload,
          ...(persisted && typeof persisted === 'object' ? persisted : {}),
        },
      }
    },

    /**
     * @param {{ paymentTransaction?: any, order?: any, financeEntry?: any, financeTargetName?: string, actorId?: string, financeReference?: string, notes?: string }} input
     * @returns {Record<string, any>}
     */
    buildReconciliationRecord(input = {}) {
      const paymentTransaction = input.paymentTransaction || {}
      const order = input.order || {}
      const financeEntry = input.financeEntry || {}

      return {
        orderId: order.id || paymentTransaction.orderId || null,
        orderNumber: order.orderNumber || paymentTransaction.orderNumber || null,
        paymentTransactionId: paymentTransaction.id || null,
        direction: 'inbound',
        amount: Number(Number(paymentTransaction.amount || order?.totalsSnapshot?.grandTotal || 0).toFixed(2)),
        currency: paymentTransaction.currency || order.currency || 'NAD',
        status: 'matched',
        sourceMethod: paymentTransaction.method || order.paymentMethod || null,
        sourceReference: input.financeReference || paymentTransaction.externalReference || null,
        financeTarget: input.financeTargetName || this.resolveFinanceTargetName(),
        financeEntryId: financeEntry.id || null,
        matchedAt: now().toISOString(),
        matchedBy: input.actorId || null,
        notes: input.notes || null,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        createdBy: input.actorId || null,
        updatedBy: input.actorId || null,
      }
    },

    /**
     * @param {{ paymentTransaction?: any, order?: any, financeEntry?: any, financeTargetName?: string, actorId?: string, financeReference?: string, notes?: string }} input
     */
    async createReconciliationRecord(input = {}) {
      const payload = this.buildReconciliationRecord(input)

      if (!financeReconciliationsCollection?.actions) {
        return payload
      }

      const persisted = await createCollectionRecord(financeReconciliationsCollection.actions, payload)
      return {
        ...payload,
        ...(persisted && typeof persisted === 'object' ? persisted : {}),
      }
    },

    /**
     * @param {{ paymentTransaction?: any, order?: any, actorId?: string, financeReference?: string, notes?: string }} input
     */
    async reconcilePayment(input = {}) {
      const financeEntryResult = await this.createFinanceEntry(input)
      const reconciliation = await this.createReconciliationRecord({
        ...input,
        financeEntry: financeEntryResult.entry,
        financeTargetName: financeEntryResult.targetName,
      })

      return {
        financeEntry: financeEntryResult.entry,
        financeEntrySkipped: financeEntryResult.skipped,
        financeTargetName: financeEntryResult.targetName,
        reconciliation,
      }
    },
  }
}

export default createFinanceSyncService
