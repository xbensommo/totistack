/**
 * @file src/apps/ecommerce/services/analytics.service.js
 * @description Commerce analytics helpers.
 */

/**
 * @param {{}} deps
 */
export function createAnalyticsService(deps = {}) {
  void deps

  return {
    /**
     * @param {Array<{ totalsSnapshot?: { grandTotal?: number } }>} orders
     */
    computeRevenue(orders = []) {
      return Number(orders.reduce((sum, order) => {
        return sum + Number(order?.totalsSnapshot?.grandTotal || 0)
      }, 0).toFixed(2))
    },

    /**
     * @param {Array<{ totalsSnapshot?: { grandTotal?: number } }>} orders
     */
    computeAverageOrderValue(orders = []) {
      if (!orders.length) return 0
      return Number((this.computeRevenue(orders) / orders.length).toFixed(2))
    },

    /**
     * @param {Array<{ stockQty?: number, reservedQty?: number, lowStockThreshold?: number, status?: string }>} variants
     */
    countLowStockVariants(variants = []) {
      return variants.filter((variant) => {
        if (variant?.status === 'archived') return false
        const available = Number(variant?.stockQty || 0) - Number(variant?.reservedQty || 0)
        return available <= Number(variant?.lowStockThreshold || 0)
      }).length
    },

    /**
     * @param {Array<{ abandonedAt?: string | null, recoveredAt?: string | null }>} carts
     */
    countAbandonedCarts(carts = []) {
      return carts.filter((cart) => cart?.abandonedAt && !cart?.recoveredAt).length
    },
  }
}
