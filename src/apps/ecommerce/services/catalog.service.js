/**
 * @file src/apps/ecommerce/services/catalog.service.js
 * @description Catalog business service.
 */

import { commitCollectionUpdate, requireEntityId } from './ecommerce-core-actions.js'
import { EcommerceAppError } from '../utils/ecommerce.errors.js'

/**
 * @param {{ productsCollection?: any, productVariantsCollection?: any, actionModal?: { requestEcommerceAction: Function }, notificationService?: any, now?: () => Date }} deps
 */
export function createCatalogService(deps = {}) {
  const {
    productsCollection,
    productVariantsCollection,
    actionModal,
    notificationService,
    now = () => new Date(),
  } = deps

  return {
    /**
     * Build a lean storefront product card.
     * @param {Record<string, any>} product
     * @param {Record<string, any>[]} variants
     */
    buildProductCard(product = {}, variants = []) {
      const firstVariant = variants[0] || null
      const firstMedia = Array.isArray(product.media) ? product.media[0] : null

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        type: product.type || 'product',
        fulfillmentType: product.fulfillmentType || 'shipping',
        status: product.status,
        shortDescription: product.shortDescription || '',
        image: firstMedia?.url || firstMedia || null,
        price: firstVariant?.price ?? null,
        compareAtPrice: firstVariant?.compareAtPrice ?? null,
        available: variants.some((variant) => Number(variant.stockQty || 0) > 0 || variant.stockTracking === false),
        ratingAverage: product.ratingSummary?.average || 0,
        ratingCount: product.ratingSummary?.count || 0,
      }
    },

    /**
     * Validate product before publication.
     * @param {Record<string, any>} product
     * @param {Record<string, any>[]} variants
     */
    validatePublishReadiness(product = {}, variants = []) {
      const issues = []
      const isService = (product?.type || 'product') === 'service'

      if (!product?.name) issues.push('Product name is required.')
      if (!product?.slug) issues.push('Product slug is required.')
      if (!product?.fullDescription) issues.push('Product description is required.')
      if (!Array.isArray(product?.categoryIds) || product.categoryIds.length === 0) {
        issues.push('At least one category is required.')
      }
      if (!isService && (!Array.isArray(product?.media) || product.media.length === 0)) {
        issues.push('At least one product image is required.')
      }
      if (!variants.length) issues.push('At least one product variant is required.')
      if (!variants.some((variant) => typeof variant.price === 'number' && variant.price >= 0)) {
        issues.push('At least one variant must have a valid price.')
      }
      if (isService) {
        if (!variants.some((variant) => variant.stockTracking === false || variant.deliveryMode === 'service')) {
          issues.push('Service variants should not rely on stock tracking.')
        }
      } else if (!variants.some((variant) => Number(variant.stockQty || 0) > 0 || variant.stockTracking === false)) {
        issues.push('At least one variant must be sellable or intentionally non-stock tracked.')
      }

      return {
        ready: issues.length === 0,
        issues,
      }
    },

    /**
     * @param {string} productId
     * @returns {Record<string, any>[]}
     */
    getVariantsForProduct(productId) {
      return (productVariantsCollection?.items || []).filter((variant) => variant.productId === productId)
    },

    /**
     * @param {Array<Record<string, any>>} products
     */
    buildCatalogSummary(products = []) {
      return products.reduce((summary, product) => {
        const type = product?.type || 'product'
        summary.total += 1
        if (type === 'service') summary.services += 1
        else summary.products += 1
        if (product?.status === 'active') summary.active += 1
        return summary
      }, { total: 0, products: 0, services: 0, active: 0 })
    },

    /**
     * Publish a product after readiness checks.
     * @param {Record<string, any>} product
     * @param {{ actorId?: string }} [options]
     */
    async publishProduct(product, options = {}) {
      const productId = requireEntityId(product, 'product')
      const variants = this.getVariantsForProduct(productId)
      const readiness = this.validatePublishReadiness(product, variants)

      if (!readiness.ready) {
        throw new EcommerceAppError('Product is not ready for publication.', {
          code: 'ecommerce/product-not-ready',
          meta: readiness,
        })
      }

      const payload = {
        ...product,
        status: 'active',
        publishedAt: now().toISOString(),
        updatedAt: now().toISOString(),
        updatedBy: options.actorId || null,
      }

      if (productsCollection?.actions) {
        await commitCollectionUpdate(productsCollection.actions, productId, payload)
      }

      if (notificationService?.isConfigured?.()) {
        await notificationService.emitCatalogPublished({ product: payload, actorId: options.actorId || null })
      }

      return { ok: true, product: payload }
    },

    /**
     * Archive a product after explicit confirmation.
     * @param {Record<string, any>} product
     */
    async archiveProduct(product) {
      const productId = requireEntityId(product, 'product')

      const decision = await actionModal?.requestEcommerceAction?.({
        intent: 'archive-product',
        title: 'Archive product',
        message: `Archive "${product.name || 'this product'}" from selling channels?`,
        confirmLabel: 'Archive product',
        tone: 'danger',
        meta: { productId },
      })

      if (!decision?.confirmed) {
        return { ok: false, skipped: true, reason: decision?.reason || 'cancelled' }
      }

      const payload = {
        ...product,
        status: 'archived',
        isArchived: true,
        archivedAt: now().toISOString(),
        updatedAt: now().toISOString(),
      }

      if (productsCollection?.actions) {
        await commitCollectionUpdate(productsCollection.actions, productId, payload)
      }

      return { ok: true, product: payload }
    },
  }
}
