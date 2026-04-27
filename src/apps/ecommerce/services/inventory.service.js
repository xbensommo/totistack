/**
 * @file src/apps/ecommerce/services/inventory.service.js
 * @description Inventory availability and movement computations.
 */

import { EcommerceAppError } from '../utils/ecommerce.errors.js'
import { createCollectionRecord } from './ecommerce-core-actions.js'

/**
 * @param {{ inventoryMovementsCollection?: any, now?: () => Date }} deps
 */
export function createInventoryService(deps = {}) {
  const { inventoryMovementsCollection, now = () => new Date() } = deps

  return {
    /**
     * @param {{ onHand?: number, reserved?: number, incoming?: number, lowStockThreshold?: number }} state
     */
    computeAvailability(state = {}) {
      const onHand = Number(state.onHand || 0)
      const reserved = Number(state.reserved || 0)
      const incoming = Number(state.incoming || 0)
      const available = Math.max(0, onHand - reserved)
      const threshold = Number(state.lowStockThreshold || 0)

      return {
        onHand,
        reserved,
        incoming,
        available,
        lowStock: available <= threshold,
        outOfStock: available <= 0,
      }
    },

    /**
     * @param {{ onHand?: number, reserved?: number }} currentState
     * @param {{ type: string, quantity: number }} movement
     */
    computeInventoryDelta(currentState = {}, movement = {}) {
      const onHand = Number(currentState.onHand || 0)
      const reserved = Number(currentState.reserved || 0)
      const quantity = Number(movement.quantity || 0)

      let nextOnHand = onHand
      let nextReserved = reserved

      switch (movement.type) {
        case 'sale':
          if (quantity > onHand) {
            throw new EcommerceAppError('Cannot sell more than is on hand.', {
              code: 'ecommerce/insufficient-stock',
              meta: { onHand, quantity },
            })
          }
          nextOnHand -= quantity
          nextReserved = Math.max(0, nextReserved - quantity)
          break
        case 'reserve':
          if (quantity > Math.max(0, onHand - reserved)) {
            throw new EcommerceAppError('Cannot reserve more than is available.', {
              code: 'ecommerce/insufficient-stock',
              meta: { available: Math.max(0, onHand - reserved), quantity },
            })
          }
          nextReserved += quantity
          break
        case 'release-reservation':
          nextReserved = Math.max(0, nextReserved - quantity)
          break
        case 'restock':
          nextOnHand += quantity
          break
        case 'damage':
          nextOnHand = Math.max(0, nextOnHand - quantity)
          break
        case 'return':
          nextOnHand += quantity
          break
        default:
          break
      }

      return {
        previousState: { onHand, reserved },
        nextState: { onHand: nextOnHand, reserved: nextReserved },
      }
    },

    /**
     * Persist an inventory movement through centralized root-store actions when available.
     *
     * @param {Record<string, any>} movement
     */
    async logMovement(movement = {}) {
      const payload = {
        ...movement,
        createdAt: movement.createdAt || now().toISOString(),
      }

      if (inventoryMovementsCollection?.actions) {
        await createCollectionRecord(inventoryMovementsCollection.actions, payload)
      }

      return payload
    },
  }
}
