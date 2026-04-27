/**
 * @file orders/business/default-profile.js
 * @description Resolve and normalize business profiles for the Orders app.
 */

import genericProfile from './profiles/generic.js'
import totisoftProfile from './profiles/totisoft.js'
import eduprolicProfile from './profiles/eduprolic.js'

export const ORDER_BUSINESS_PROFILES = Object.freeze({
  generic: genericProfile,
  totisoft: totisoftProfile,
  eduprolic: eduprolicProfile,
})

/**
 * @param {string|undefined|null} profileName
 * @returns {Record<string, any>}
 */
export function resolveOrderBusinessProfile(profileName) {
  const normalized = String(profileName || 'generic').trim().toLowerCase()
  return ORDER_BUSINESS_PROFILES[normalized] || ORDER_BUSINESS_PROFILES.generic
}

/**
 * @param {object} [options]
 * @param {string} [options.profileName]
 * @returns {Record<string, any>}
 */
export function getDefaultOrderBusinessProfile(options = {}) {
  return resolveOrderBusinessProfile(options.profileName)
}

export default getDefaultOrderBusinessProfile
