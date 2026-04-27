/**
 * @file src/features/portal/services/portalService.js
 * @description Root-store-first portal service for external-user self-service experiences.
 */

import { computed } from 'vue'
import { useAppStore } from '@app/stores/appStore/index.js'
import {
  FeatureAuthorizationError,
  FeatureValidationError,
  assertAccess,
  createId,
  fetchDirectCollectionItems,
  getCollectionState,
  hasPermission,
  normalizeError,
} from '../../shared/featureToolkit.js'
import { createActionModalService } from '@core/action_modal/index.js'
import { DEFAULT_PORTAL_PROFILE_KEY, getPortalProfileActions, resolvePortalProfile } from '../business/default-profile.js'
import { PORTAL_PERMISSIONS, canAccessMembership, hasPortalPermission } from '../permissions.js'

export const PORTAL_COLLECTIONS = Object.freeze({
  accounts: 'portal_accounts',
  invites: 'portal_invites',
  memberships: 'portal_memberships',
  preferences: 'portal_preferences',
  activityLogs: 'portal_activity_logs',
  tickets: 'portal_tickets',
})

function asText(value) {
  return String(value || '').trim()
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function normalizeDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))]
}

function getActor(store) {
  return store?.currentUser?.value || store?.currentUser || null
}

function getActorId(store) {
  const actor = getActor(store)
  return actor?.uid || actor?.id || null
}

function safeFilterItems(items, predicate) {
  return Array.isArray(items) ? items.filter(predicate) : []
}

function firstSupportedCollection(store, aliases = []) {
  for (const collectionName of aliases) {
    const actions = store?.[collectionName + 'Actions']
    if (actions) return actions
  }

  return null
}

function summarizeCount(items = []) {
  return Array.isArray(items) ? items.length : 0
}

/**
 * Create the portal service.
 *
 * @param {object} [store=useAppStore()]
 * @param {{ confirm?: Function }} [options={}]
 * @returns {object}
 */
export function createPortalService(store = useAppStore(), options = {}) {
  let activeProfileKey = DEFAULT_PORTAL_PROFILE_KEY
  const requiredActions = Object.freeze(
    Object.fromEntries(
      Object.values(PORTAL_COLLECTIONS).map((collectionName) => {
        const actionKey = `${collectionName}Actions`
        const actions = store?.[actionKey]
        if (!actions || typeof actions !== 'object') {
          throw new Error(`Missing root-store shard actions: store.${actionKey}`)
        }
        return [collectionName, actions]
      }),
    ),
  )

  function setFeatureError(error) {
    if (typeof store?.setError === 'function') {
      store.setError(error)
    }
  }

  function assertPermission(permission, message = 'You are not allowed to perform this portal action.') {
    const actor = getActor(store)
    if (hasPortalPermission(actor, permission) || hasPermission(actor, permission)) return
    throw new FeatureAuthorizationError(message, { permission })
  }

  async function safeExecute(message, operation) {
    try {
      return await operation()
    } catch (error) {
      const normalized = normalizeError(error, message)
      setFeatureError(normalized)
      throw normalized
    }
  }

  function resolveProfile(profileKey) {
    return resolvePortalProfile(profileKey || activeProfileKey || getActor(store)?.portalProfileKey || DEFAULT_PORTAL_PROFILE_KEY)
  }

  function setBusinessProfile(profileKey) {
    activeProfileKey = resolveProfile(profileKey).key
    return resolveProfile(activeProfileKey)
  }

  function buildAccountPayload(payload = {}) {
    const now = new Date()
    const actorId = getActorId(store)
    const email = asText(payload.email)
    const externalUserId = payload.externalUserId || payload.userId || actorId

    if (!email) {
      throw new FeatureValidationError('Portal account email is required.')
    }

    if (!externalUserId) {
      throw new FeatureValidationError('Portal account requires an external user id.')
    }

    return {
      externalUserId,
      email,
      displayName: asText(payload.displayName) || null,
      status: payload.status || 'active',
      businessProfileKey: resolveProfile(payload.businessProfileKey).key,
      accountRole: payload.accountRole || resolveProfile(payload.businessProfileKey).defaultMembershipRole,
      avatarUrl: payload.avatarUrl || null,
      preferredLanguage: payload.preferredLanguage || null,
      lastSeenAt: normalizeDate(payload.lastSeenAt),
      suspendedAt: normalizeDate(payload.suspendedAt),
      suspendedReason: asText(payload.suspendedReason) || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      createdBy: payload.createdBy || actorId,
    }
  }

  function buildInvitePayload(payload = {}) {
    const actorId = getActorId(store)
    const email = asText(payload.email)

    if (!email) {
      throw new FeatureValidationError('Invite email is required.')
    }

    return {
      email,
      status: payload.status || 'pending',
      businessProfileKey: resolveProfile(payload.businessProfileKey).key,
      invitedRole: payload.invitedRole || resolveProfile(payload.businessProfileKey).defaultMembershipRole,
      inviteToken: payload.inviteToken || createId('portal_invite'),
      expiresAt: normalizeDate(payload.expiresAt) || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      acceptedAt: normalizeDate(payload.acceptedAt),
      invitedBy: payload.invitedBy || actorId,
      note: asText(payload.note) || null,
      linkedRecordType: payload.linkedRecordType || null,
      linkedRecordId: payload.linkedRecordId || null,
      createdAt: payload.createdAt || new Date(),
      updatedAt: new Date(),
    }
  }

  function buildMembershipPayload(payload = {}) {
    const actorId = getActorId(store)

    if (!payload.portalAccountId) {
      throw new FeatureValidationError('Membership requires portalAccountId.')
    }

    if (!payload.externalUserId) {
      throw new FeatureValidationError('Membership requires externalUserId.')
    }

    return {
      portalAccountId: payload.portalAccountId,
      externalUserId: payload.externalUserId,
      membershipRole: payload.membershipRole || resolveProfile(payload.businessProfileKey).defaultMembershipRole,
      status: payload.status || 'active',
      businessProfileKey: resolveProfile(payload.businessProfileKey).key,
      linkedRecordType: payload.linkedRecordType || null,
      linkedRecordId: payload.linkedRecordId || null,
      linkedAccountId: payload.linkedAccountId || null,
      linkedClientId: payload.linkedClientId || null,
      linkedStudentId: payload.linkedStudentId || null,
      linkedOrderId: payload.linkedOrderId || null,
      visibilityScope: payload.visibilityScope || 'self',
      createdAt: payload.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: payload.createdBy || actorId,
    }
  }

  function buildTicketPayload(payload = {}) {
    const actor = getActor(store)
    const actorId = getActorId(store)

    if (!payload.portalAccountId) {
      throw new FeatureValidationError('Support ticket requires portalAccountId.')
    }

    if (!asText(payload.subject) || !asText(payload.message)) {
      throw new FeatureValidationError('Support ticket requires subject and message.')
    }

    return {
      portalAccountId: payload.portalAccountId,
      externalUserId: payload.externalUserId || actorId,
      membershipId: payload.membershipId || null,
      subject: asText(payload.subject),
      message: asText(payload.message),
      category: payload.category || 'general',
      priority: payload.priority || 'normal',
      status: payload.status || 'open',
      linkedEntityType: payload.linkedEntityType || null,
      linkedEntityId: payload.linkedEntityId || null,
      assignedTo: payload.assignedTo || null,
      businessProfileKey: resolveProfile(payload.businessProfileKey || actor?.portalProfileKey).key,
      createdAt: payload.createdAt || new Date(),
      updatedAt: new Date(),
    }
  }

  function buildActivityLogPayload(payload = {}) {
    return {
      portalAccountId: payload.portalAccountId || null,
      externalUserId: payload.externalUserId || getActorId(store),
      membershipId: payload.membershipId || null,
      actionKey: payload.actionKey || 'portal.activity',
      title: payload.title || 'Portal activity',
      description: payload.description || null,
      entityType: payload.entityType || null,
      entityId: payload.entityId || null,
      actorType: payload.actorType || 'portal_user',
      actorId: payload.actorId || getActorId(store),
      meta: payload.meta || {},
      createdAt: payload.createdAt || new Date(),
      updatedAt: new Date(),
    }
  }

  async function logActivity(payload) {
    return safeExecute('Failed to write portal activity log.', async () => {
      return requiredActions[PORTAL_COLLECTIONS.activityLogs].add(buildActivityLogPayload(payload))
    })
  }

  async function createPortalAccount(payload) {
    assertPermission(PORTAL_PERMISSIONS.INVITES_MANAGE, 'You are not allowed to provision portal accounts.')
    return safeExecute('Failed to create portal account.', async () => {
      const normalized = buildAccountPayload(payload)
      return requiredActions[PORTAL_COLLECTIONS.accounts].add(normalized)
    })
  }

  async function createInvite(payload) {
    assertPermission(PORTAL_PERMISSIONS.INVITES_MANAGE, 'You are not allowed to create portal invites.')
    return safeExecute('Failed to create portal invite.', async () => {
      const invite = buildInvitePayload(payload)
      const result = await requiredActions[PORTAL_COLLECTIONS.invites].add(invite)
      await logActivity({
        actionKey: 'portal.invite.created',
        title: 'Portal invite created',
        description: `Invite created for ${invite.email}.`,
        entityType: 'portal_invite',
        entityId: result?.id || invite.inviteToken,
        meta: { email: invite.email, businessProfileKey: invite.businessProfileKey },
      })
      return result
    })
  }

  async function acceptInvite(inviteId, payload = {}) {
    return safeExecute('Failed to accept portal invite.', async () => {
      if (!inviteId) {
        throw new FeatureValidationError('Invite id is required.')
      }

      const invite = await requiredActions[PORTAL_COLLECTIONS.invites].getById(inviteId)
      if (!invite) {
        throw new FeatureValidationError('Portal invite was not found.')
      }

      if (invite.status !== 'pending') {
        throw new FeatureValidationError('Only pending invites can be accepted.')
      }

      if (normalizeDate(invite.expiresAt)?.getTime() < Date.now()) {
        throw new FeatureValidationError('This portal invite has expired.')
      }

      const account = buildAccountPayload({
        email: invite.email,
        externalUserId: payload.externalUserId || getActorId(store),
        displayName: payload.displayName,
        businessProfileKey: invite.businessProfileKey,
        accountRole: invite.invitedRole,
      })
      const accountResult = await requiredActions[PORTAL_COLLECTIONS.accounts].add(account)
      await requiredActions[PORTAL_COLLECTIONS.invites].update(inviteId, {
        status: 'accepted',
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      await requiredActions[PORTAL_COLLECTIONS.memberships].add(buildMembershipPayload({
        portalAccountId: accountResult?.id || account.externalUserId,
        externalUserId: account.externalUserId,
        membershipRole: invite.invitedRole,
        businessProfileKey: invite.businessProfileKey,
        linkedRecordType: invite.linkedRecordType,
        linkedRecordId: invite.linkedRecordId,
      }))
      await logActivity({
        portalAccountId: accountResult?.id || account.externalUserId,
        externalUserId: account.externalUserId,
        actionKey: 'portal.invite.accepted',
        title: 'Portal invite accepted',
        description: `${invite.email} joined the portal.`,
        entityType: 'portal_invite',
        entityId: inviteId,
      })
      return accountResult
    })
  }

  async function grantMembership(payload) {
    assertPermission(PORTAL_PERMISSIONS.MEMBERSHIPS_MANAGE, 'You are not allowed to manage portal memberships.')
    return safeExecute('Failed to grant portal membership.', async () => {
      const membership = buildMembershipPayload(payload)
      const result = await requiredActions[PORTAL_COLLECTIONS.memberships].add(membership)
      await logActivity({
        portalAccountId: membership.portalAccountId,
        externalUserId: membership.externalUserId,
        actionKey: 'portal.membership.granted',
        title: 'Portal membership granted',
        description: `Granted ${membership.membershipRole} access.`,
        entityType: 'portal_membership',
        entityId: result?.id || membership.portalAccountId,
      })
      return result
    })
  }

  async function suspendPortalAccount(accountId, reason = 'Suspended by administrator.') {
    assertPermission(PORTAL_PERMISSIONS.ADMIN_MANAGE, 'You are not allowed to suspend portal accounts.')
    return safeExecute('Failed to suspend portal account.', async () => {
      if (!accountId) throw new FeatureValidationError('Portal account id is required.')
      const result = await requiredActions[PORTAL_COLLECTIONS.accounts].update(accountId, {
        status: 'suspended',
        suspendedAt: new Date(),
        suspendedReason: asText(reason) || 'Suspended by administrator.',
        updatedAt: new Date(),
      })
      await logActivity({
        portalAccountId: accountId,
        actionKey: 'portal.account.suspended',
        title: 'Portal account suspended',
        description: asText(reason) || 'Portal account suspended.',
        entityType: 'portal_account',
        entityId: accountId,
      })
      return result
    })
  }

  async function savePreferences(payload = {}) {
    return safeExecute('Failed to save portal preferences.', async () => {
      const actorId = getActorId(store)
      const account = await getMyPortalAccount()
      if (!account?.id && !payload.portalAccountId) {
        throw new FeatureValidationError('Portal preferences require an account context.')
      }

      const preferencesPayload = {
        portalAccountId: payload.portalAccountId || account.id,
        externalUserId: payload.externalUserId || actorId,
        theme: payload.theme || null,
        locale: payload.locale || null,
        notificationChannels: asArray(payload.notificationChannels),
        homeSectionKey: payload.homeSectionKey || null,
        compactMode: Boolean(payload.compactMode),
        createdAt: payload.createdAt || new Date(),
        updatedAt: new Date(),
      }

      const existingItems = safeFilterItems(
        await fetchDirectCollectionItems(store, PORTAL_COLLECTIONS.preferences, requiredActions[PORTAL_COLLECTIONS.preferences], {
          filters: [{ field: 'portalAccountId', op: '==', value: preferencesPayload.portalAccountId }],
          limit: 5,
        }),
        Boolean,
      )

      if (existingItems[0]?.id) {
        return requiredActions[PORTAL_COLLECTIONS.preferences].update(existingItems[0].id, {
          ...preferencesPayload,
          createdAt: existingItems[0].createdAt || preferencesPayload.createdAt,
        })
      }

      return requiredActions[PORTAL_COLLECTIONS.preferences].add(preferencesPayload)
    })
  }

  async function getMyPortalAccount() {
    return safeExecute('Failed to load portal account.', async () => {
      const actorId = getActorId(store)
      if (!actorId) return null
      const items = await fetchDirectCollectionItems(store, PORTAL_COLLECTIONS.accounts, requiredActions[PORTAL_COLLECTIONS.accounts], {
        filters: [{ field: 'externalUserId', op: '==', value: actorId }],
        limit: 5,
      })
      return items[0] || null
    })
  }

  async function getMyMemberships() {
    return safeExecute('Failed to load portal memberships.', async () => {
      const actorId = getActorId(store)
      if (!actorId) return []
      const account = await getMyPortalAccount()
      const items = await fetchDirectCollectionItems(store, PORTAL_COLLECTIONS.memberships, requiredActions[PORTAL_COLLECTIONS.memberships], {
        filters: account?.id
            ? [{ field: 'portalAccountId', op: '==', value: account.id }]
            : [{ field: 'externalUserId', op: '==', value: actorId }],
        limit: 100,
      })
      return safeFilterItems(items, (item) => item?.status !== 'archived')
    })
  }

  async function getPortalTickets() {
    return safeExecute('Failed to load portal tickets.', async () => {
      const account = await getMyPortalAccount()
      if (!account?.id) return []
      return fetchDirectCollectionItems(store, PORTAL_COLLECTIONS.tickets, requiredActions[PORTAL_COLLECTIONS.tickets], {
        filters: [{ field: 'portalAccountId', op: '==', value: account.id }],
        limit: 100,
      })
    })
  }

  async function getPortalPreferences() {
    return safeExecute('Failed to load portal preferences.', async () => {
      const account = await getMyPortalAccount()
      if (!account?.id) return null
      const items = await fetchDirectCollectionItems(store, PORTAL_COLLECTIONS.preferences, requiredActions[PORTAL_COLLECTIONS.preferences], {
        filters: [{ field: 'portalAccountId', op: '==', value: account.id }],
        limit: 5,
      })
      return items[0] || null
    })
  }

  async function submitSupportTicket(payload = {}) {
    assertPermission(PORTAL_PERMISSIONS.SUPPORT_CREATE, 'You are not allowed to create portal support tickets.')
    return safeExecute('Failed to create support ticket.', async () => {
      const account = await getMyPortalAccount()
      if (!account?.id) {
        throw new FeatureValidationError('Portal account is required before creating support tickets.')
      }
      const ticket = buildTicketPayload({
        ...payload,
        portalAccountId: payload.portalAccountId || account.id,
        externalUserId: payload.externalUserId || account.externalUserId,
        businessProfileKey: payload.businessProfileKey || account.businessProfileKey,
      })
      const result = await requiredActions[PORTAL_COLLECTIONS.tickets].add(ticket)
      await logActivity({
        portalAccountId: account.id,
        externalUserId: ticket.externalUserId,
        membershipId: ticket.membershipId,
        actionKey: 'portal.ticket.created',
        title: 'Support ticket created',
        description: ticket.subject,
        entityType: 'portal_ticket',
        entityId: result?.id || ticket.subject,
      })
      return result
    })
  }

  function buildLinkKeys(memberships = [], account = null) {
    const keys = new Set()
    const actorId = getActorId(store)

    keys.add(actorId)
    keys.add(account?.id)
    keys.add(account?.externalUserId)

    for (const membership of memberships) {
      keys.add(membership?.id)
      keys.add(membership?.portalAccountId)
      keys.add(membership?.externalUserId)
      keys.add(membership?.linkedRecordId)
      keys.add(membership?.linkedAccountId)
      keys.add(membership?.linkedClientId)
      keys.add(membership?.linkedStudentId)
      keys.add(membership?.linkedOrderId)
    }

    return unique([...keys])
  }

  async function fetchLinkedCollection(aliasKey, memberships = [], profile = resolveProfile()) {
    const aliases = asArray(profile?.collectionAliases?.[aliasKey])
    if (aliases.length === 0) return []

    const externalActions = firstSupportedCollection(store, aliases)
    if (!externalActions) return []

    if (typeof externalActions.fetchInitialPage === 'function') {
      await externalActions.fetchInitialPage({ limit: 200 })
    }

    const linkedState = aliases
      .map((collectionName) => getCollectionState(store, collectionName))
      .find((slice) => Array.isArray(slice?.items) || Array.isArray(slice?.value?.items) || Array.isArray(slice?.value) || Array.isArray(slice))

    const items = Array.isArray(linkedState?.value?.items)
      ? linkedState.value.items
      : Array.isArray(linkedState?.items)
        ? linkedState.items
        : Array.isArray(linkedState?.value)
          ? linkedState.value
          : Array.isArray(linkedState)
            ? linkedState
            : []

    const account = await getMyPortalAccount()
    const linkKeys = buildLinkKeys(memberships, account)
    const relationFields = [
      'portalAccountId',
      'membershipId',
      'externalUserId',
      'userId',
      'clientId',
      'customerId',
      'studentId',
      'accountId',
      'linkedRecordId',
      'orderId',
      'recordId',
      'sourceId',
    ]

    return safeFilterItems(items, (item) => relationFields.some((field) => linkKeys.includes(item?.[field])))
  }

  async function getWorkspace(profileKey) {
    return safeExecute('Failed to load portal workspace.', async () => {
      const account = await getMyPortalAccount()
      const memberships = await getMyMemberships()
      const profile = resolveProfile(profileKey || account?.businessProfileKey)

      const [records, documents, billing, orders, tickets, preferences] = await Promise.all([
        fetchLinkedCollection('records', memberships, profile),
        fetchLinkedCollection('documents', memberships, profile),
        fetchLinkedCollection('billing', memberships, profile),
        fetchLinkedCollection('orders', memberships, profile),
        getPortalTickets(),
        getPortalPreferences(),
      ])

      return {
        account,
        memberships,
        preferences,
        profile,
        records,
        documents,
        billing,
        orders,
        tickets,
      }
    })
  }

  async function getDashboardSummary(profileKey) {
    return safeExecute('Failed to load portal dashboard.', async () => {
      const workspace = await getWorkspace(profileKey)
      return {
        profile: workspace.profile,
        account: workspace.account,
        widgets: workspace.profile.dashboardWidgets,
        counts: {
          memberships: summarizeCount(workspace.memberships),
          records: summarizeCount(workspace.records),
          documents: summarizeCount(workspace.documents),
          billing: summarizeCount(workspace.billing),
          orders: summarizeCount(workspace.orders),
          tickets: summarizeCount(workspace.tickets),
        },
      }
    })
  }

  function buildActionDefinitions(profile) {
    const profileActions = getPortalProfileActions(profile.key)

    return Object.fromEntries(
      Object.entries(profileActions).map(([actionKey, definition]) => [
        actionKey,
        {
          confirm: definition.confirm
            ? { title: definition.label, message: definition.confirm }
            : null,
          run: async (context = {}) => {
            if (definition.permission) {
              assertPermission(definition.permission, 'You are not allowed to run this portal action.')
            }

            if (actionKey === 'requestSupport') {
              return submitSupportTicket({
                subject: context.subject || definition.label,
                message: context.message || context.note || 'Portal support request submitted.',
                priority: context.priority || 'normal',
                category: context.category || 'general',
                membershipId: context.membershipId || null,
                linkedEntityType: context.linkedEntityType || context.entityType || null,
                linkedEntityId: context.linkedEntityId || context.recordId || context.orderId || context.documentId || null,
                businessProfileKey: profile.key,
              })
            }

            const account = await getMyPortalAccount()
            return logActivity({
              portalAccountId: account?.id || null,
              externalUserId: account?.externalUserId || getActorId(store),
              membershipId: context.membershipId || null,
              actionKey: `portal.action.${actionKey}`,
              title: definition.label,
              description: context.note || context.message || definition.label,
              entityType: context.entityType || null,
              entityId: context.recordId || context.orderId || context.documentId || null,
              meta: { ...context, businessProfileKey: profile.key },
            })
          },
        },
      ]),
    )
  }

  async function runBusinessAction(actionKey, context = {}) {
    return safeExecute('Failed to complete portal action.', async () => {
      const workspace = await getWorkspace(context.profileKey)
      const actionService = createActionModalService({
        actions: buildActionDefinitions(workspace.profile),
        confirm: options.confirm,
      })
      return actionService.runAction(actionKey, context)
    })
  }

  async function listAllMemberships() {
    assertPermission(PORTAL_PERMISSIONS.MEMBERSHIPS_VIEW, 'You are not allowed to view portal memberships.')
    return safeExecute('Failed to load portal memberships.', async () => {
      return fetchDirectCollectionItems(store, PORTAL_COLLECTIONS.memberships, requiredActions[PORTAL_COLLECTIONS.memberships], { limit: 250 })
    })
  }

  return {
    PORTAL_COLLECTIONS,
    currentProfile: computed(() => resolveProfile()),
    setBusinessProfile,
    resolveProfile,
    createPortalAccount,
    createInvite,
    acceptInvite,
    grantMembership,
    suspendPortalAccount,
    savePreferences,
    getMyPortalAccount,
    getMyMemberships,
    getPortalPreferences,
    getPortalTickets,
    getWorkspace,
    getDashboardSummary,
    submitSupportTicket,
    runBusinessAction,
    listAllMemberships,
    canAccessMembership: (membership) => canAccessMembership(getActor(store), membership),
    hasPortalPermission: (permission) => hasPortalPermission(getActor(store), permission),
  }
}

export function usePortalService() {
  return createPortalService()
}

export default createPortalService
