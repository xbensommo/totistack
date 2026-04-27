/**
 * @file src/apps/ecommerce/services/cart.service.js
 * @description Cart summary computations.
 */

/**
 * @param {{ pricingService?: any }} deps
 */
export function createCartService(deps = {}) {
  const { pricingService } = deps

  return {
    /**
     * @param {{ lineItems?: Record<string, any>[], shippingChoice?: { amount?: number }, discounts?: Record<string, any>[] }} cart
     * @param {{ customerGroupId?: string }} [customer]
     */
    buildCartTotals(cart = {}, customer = {}) {
      const lineItems = Array.isArray(cart.lineItems) ? cart.lineItems : []

      let subtotal = 0
      let compareAtTotal = 0
      const normalizedItems = lineItems.map((item) => {
        const price = pricingService.resolveSellPrice(item.variant, customer, item.rules || [])
        const quantity = Number(item.quantity || 0)
        const lineTotal = Number((price.finalPrice * quantity).toFixed(2))
        subtotal += lineTotal
        compareAtTotal += Number(((price.compareAtPrice || price.basePrice) * quantity).toFixed(2))

        return {
          ...item,
          resolvedPrice: price,
          lineTotal,
        }
      })

      const shipping = Number(cart.shippingChoice?.amount || 0)
      const discountAmount = Math.max(0, Number((compareAtTotal - subtotal).toFixed(2)))
      const tax = Number((subtotal * 0.15).toFixed(2))
      const grandTotal = Number((subtotal + shipping + tax).toFixed(2))

      return {
        items: normalizedItems,
        summary: {
          subtotal: Number(subtotal.toFixed(2)),
          shipping,
          tax,
          discountAmount,
          grandTotal,
        },
      }
    },
  }
}
