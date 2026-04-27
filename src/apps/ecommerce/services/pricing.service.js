/**
 * @file src/apps/ecommerce/services/pricing.service.js
 * @description Pricing and discount computations.
 */

/**
 * @param {{ now?: () => Date }} deps
 */
export function createPricingService(deps = {}) {
  const { now = () => new Date() } = deps

  return {
    /**
     * Resolve final sell price.
     * @param {{ price: number, compareAtPrice?: number }} variant
     * @param {{ customerGroupId?: string }} [customer]
     * @param {Record<string, any>[]} [rules]
     */
    resolveSellPrice(variant, customer = {}, rules = []) {
      const base = Number(variant?.price || 0)
      const activeRules = rules.filter((rule) => {
        const current = now().getTime()
        const startsAt = rule?.startsAt ? new Date(rule.startsAt).getTime() : null
        const endsAt = rule?.endsAt ? new Date(rule.endsAt).getTime() : null
        if (startsAt && current < startsAt) return false
        if (endsAt && current > endsAt) return false
        if (rule?.conditions?.customerGroupId && rule.conditions.customerGroupId !== customer.customerGroupId) {
          return false
        }
        return rule?.status === 'active'
      })

      let finalPrice = base
      for (const rule of activeRules) {
        if (rule.ruleType === 'percentage') {
          finalPrice -= base * (Number(rule.value || 0) / 100)
        }
        if (rule.ruleType === 'fixed') {
          finalPrice -= Number(rule.value || 0)
        }
      }

      finalPrice = Math.max(0, Number(finalPrice.toFixed(2)))

      return {
        basePrice: base,
        finalPrice,
        compareAtPrice: Number(variant?.compareAtPrice || 0) || null,
        discountAmount: Number((base - finalPrice).toFixed(2)),
        discounted: finalPrice < base,
      }
    },
  }
}
