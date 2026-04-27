/** @file src/features/portal/business/default-profile.js */

import genericPortalProfile from './profiles/generic.js'
import studentPortalProfile from './profiles/student.js'
import clientPortalProfile from './profiles/client.js'
import ecommercePortalProfile from './profiles/ecommerce.js'

export const DEFAULT_PORTAL_PROFILE_KEY = 'generic'

export const PORTAL_PROFILE_REGISTRY = Object.freeze({
  [genericPortalProfile.key]: genericPortalProfile,
  [studentPortalProfile.key]: studentPortalProfile,
  [clientPortalProfile.key]: clientPortalProfile,
  [ecommercePortalProfile.key]: ecommercePortalProfile,
})

/**
 * Resolve a portal business profile.
 *
 * @param {string} [profileKey]
 * @returns {object}
 */
export function resolvePortalProfile(profileKey = DEFAULT_PORTAL_PROFILE_KEY) {
  return PORTAL_PROFILE_REGISTRY[profileKey] || PORTAL_PROFILE_REGISTRY[DEFAULT_PORTAL_PROFILE_KEY]
}

/**
 * Return the action definitions available for a given portal profile.
 *
 * @param {string} [profileKey]
 * @returns {Record<string, object>}
 */
export function getPortalProfileActions(profileKey) {
  return { ...resolvePortalProfile(profileKey).actionDefinitions }
}

export default resolvePortalProfile
