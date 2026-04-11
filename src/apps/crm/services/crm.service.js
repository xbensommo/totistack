/**
 * @file crm/services/crm.service.js
 * @description Production-oriented CRM domain service that uses the shared Totistack shard provider.
 */

/**
 * @typedef {object} CrmServiceContext
 * @property {object} provider
 * @property {object} [access]
 * @property {Console} [logger]
 */

const DEFAULT_LOGGER = console

/**
 * @param {unknown} value
 * @returns {string|null}
 */
function normalizeDate(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

/**
 * @param {string} prefix
 * @returns {string}
 */
function createEntityId(prefix) {
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now()}_${random}`
}

/**
 * @param {string} prefix
 * @returns {string}
 */
function createSequence(prefix) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${stamp}-${random}`
}

/**
 * @param {object} access
 * @param {string} permission
 * @returns {boolean}
 */
function canAccess(access, permission) {
  if (!access || typeof access.can !== 'function') return true
  return access.can(permission)
}

/**
 * @param {object} access
 * @param {string} permission
 */
function assertAccess(access, permission) {
  if (!canAccess(access, permission)) {
    const error = new Error(`Forbidden: missing permission "${permission}".`)
    error.code = 'CRM_FORBIDDEN'
    throw error
  }
}

/**
 * @param {object|null|undefined} user
 * @returns {string}
 */
function requireUserId(user) {
  const uid = user?.uid || user?.id
  if (!uid) {
    const error = new Error('Authentication required.')
    error.code = 'CRM_AUTH_REQUIRED'
    throw error
  }
  return uid
}

/**
 * Create a CRM service bound to the root shard provider.
 *
 * @param {CrmServiceContext} context
 * @returns {object}
 */
export function createCrmService({ provider, access, logger = DEFAULT_LOGGER }) {
  if (!provider) {
    throw new Error('[crm] provider is required to create the CRM service.')
  }

  const leads = provider.collection('crm_leads')
  const opportunities = provider.collection('crm_opportunities')
  const activities = provider.collection('crm_activities')

  return {
    /**
     * Create a lead.
     * @param {object} payload
     * @param {object} [currentUser]
     * @returns {Promise<object>}
     */
    async createLead(payload, currentUser = access?.currentUser) {
      assertAccess(access, 'crm.leads.create')
      const createdBy = requireUserId(currentUser)
      const now = new Date().toISOString()
      const lead = {
        leadNumber: payload.leadNumber || createSequence('LEAD'),
        firstName: payload.firstName?.trim() || '',
        lastName: payload.lastName?.trim() || '',
        fullName: payload.fullName || [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim(),
        email: payload.email || '',
        phone: payload.phone || '',
        company: payload.company || '',
        title: payload.title || '',
        website: payload.website || '',
        source: payload.source || 'other',
        status: payload.status || 'new',
        qualification: payload.qualification || {},
        score: payload.score || { total: 0, fit: 0, engagement: 0, behavior: 0 },
        convertedTo: payload.convertedTo || null,
        assignedTo: payload.assignedTo || null,
        assignedTeam: payload.assignedTeam || null,
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        notes: Array.isArray(payload.notes) ? payload.notes : [],
        lastActivityAt: payload.lastActivityAt || now,
        nextFollowUp: normalizeDate(payload.nextFollowUp),
        createdBy,
      }

      if (!lead.firstName || !lead.lastName) {
        throw new Error('Lead firstName and lastName are required.')
      }

      const created = await leads.add(lead)
      logger.info?.('[crm] lead created', { id: created?.id || created?.docId, leadNumber: lead.leadNumber })
      return created
    },

    /**
     * Update a lead.
     * @param {string} id
     * @param {object} payload
     * @returns {Promise<object>}
     */
    async updateLead(id, payload) {
      assertAccess(access, 'crm.leads.update')
      if (!id) throw new Error('Lead id is required.')
      return leads.update(id, payload)
    },

    /**
     * Get a lead by id.
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async getLeadById(id) {
      assertAccess(access, 'crm.leads.read')
      if (!id) throw new Error('Lead id is required.')
      return leads.getById(id)
    },

    /**
     * List leads.
     * @param {object} [filters]
     * @returns {Promise<object>}
     */
    async listLeads(filters = {}) {
      assertAccess(access, 'crm.leads.read')
      return leads.fetchInitialPage({
        filters,
        sort: { field: 'createdAt', direction: 'desc' },
      })
    },

    /**
     * Create an opportunity.
     * @param {object} payload
     * @param {object} [currentUser]
     * @returns {Promise<object>}
     */
    async createOpportunity(payload, currentUser = access?.currentUser) {
      assertAccess(access, 'crm.opportunities.create')
      const owner = payload.owner || requireUserId(currentUser)
      const probability = Number(payload.probability ?? 10)
      const amount = Number(payload.amount ?? 0)
      const opportunity = {
        name: payload.name?.trim() || '',
        opportunityNumber: payload.opportunityNumber || createSequence('OPP'),
        leadId: payload.leadId || null,
        contactId: payload.contactId || null,
        accountId: payload.accountId || null,
        amount,
        currency: payload.currency || 'USD',
        probability,
        expectedCloseDate: normalizeDate(payload.expectedCloseDate) || new Date().toISOString(),
        actualCloseDate: normalizeDate(payload.actualCloseDate),
        stage: payload.stage || 'prospecting',
        stageHistory: Array.isArray(payload.stageHistory) ? payload.stageHistory : [],
        forecastCategory: payload.forecastCategory || 'pipeline',
        weightedAmount: amount * (probability / 100),
        lineItems: Array.isArray(payload.lineItems) ? payload.lineItems : [],
        competitors: Array.isArray(payload.competitors) ? payload.competitors : [],
        decisionCriteria: payload.decisionCriteria || '',
        nextSteps: payload.nextSteps || '',
        winLossReason: payload.winLossReason || '',
        owner,
        team: payload.team || null,
        lastActivityAt: payload.lastActivityAt || new Date().toISOString(),
        lastContactAt: normalizeDate(payload.lastContactAt),
        closedAt: normalizeDate(payload.closedAt),
      }

      if (!opportunity.name) throw new Error('Opportunity name is required.')
      const created = await opportunities.add(opportunity)
      logger.info?.('[crm] opportunity created', { id: created?.id || created?.docId, opportunityNumber: opportunity.opportunityNumber })
      return created
    },

    /**
     * List opportunities.
     * @param {object} [filters]
     * @returns {Promise<object>}
     */
    async listOpportunities(filters = {}) {
      assertAccess(access, 'crm.opportunities.read')
      return opportunities.fetchInitialPage({
        filters,
        sort: { field: 'createdAt', direction: 'desc' },
      })
    },

    /**
     * Log an activity.
     * @param {object} payload
     * @param {object} [currentUser]
     * @returns {Promise<object>}
     */
    async createActivity(payload, currentUser = access?.currentUser) {
      assertAccess(access, 'crm.activities.create')
      const createdBy = requireUserId(currentUser)
      const activity = {
        leadId: payload.leadId || null,
        contactId: payload.contactId || null,
        accountId: payload.accountId || null,
        opportunityId: payload.opportunityId || null,
        type: payload.type || 'note',
        subtype: payload.subtype || '',
        subject: payload.subject?.trim() || '',
        description: payload.description || '',
        duration: Number.isFinite(Number(payload.duration)) ? Number(payload.duration) : null,
        outcome: payload.outcome || 'completed',
        communication: payload.communication || null,
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
        scheduledAt: normalizeDate(payload.scheduledAt),
        completedAt: normalizeDate(payload.completedAt) || new Date().toISOString(),
        assignedTo: payload.assignedTo || null,
        isPrivate: Boolean(payload.isPrivate),
        createdBy,
      }

      if (!activity.subject) throw new Error('Activity subject is required.')
      return activities.add(activity)
    },

    /**
     * List activities.
     * @param {object} [filters]
     * @returns {Promise<object>}
     */
    async listActivities(filters = {}) {
      assertAccess(access, 'crm.activities.read')
      return activities.fetchInitialPage({
        filters,
        sort: { field: 'createdAt', direction: 'desc' },
      })
    },

    /**
     * Convert a lead into an opportunity.
     * @param {string} leadId
     * @param {object} payload
     * @param {object} [currentUser]
     * @returns {Promise<object>}
     */
    async convertLead(leadId, payload = {}, currentUser = access?.currentUser) {
      assertAccess(access, 'crm.leads.convert')
      const lead = await leads.getById(leadId)
      if (!lead) {
        const error = new Error('Lead not found.')
        error.code = 'CRM_LEAD_NOT_FOUND'
        throw error
      }

      const convertedOpportunity = await this.createOpportunity({
        name: payload.opportunityName || `Opportunity - ${lead.fullName || `${lead.firstName} ${lead.lastName}`.trim()}`,
        leadId,
        contactId: payload.contactId || null,
        accountId: payload.accountId || null,
        amount: payload.amount || 0,
        probability: payload.probability || 10,
        expectedCloseDate: payload.expectedCloseDate || new Date().toISOString(),
        owner: payload.owner || currentUser?.uid,
        ...payload,
      }, currentUser)

      await leads.update(leadId, {
        status: 'converted',
        convertedTo: {
          opportunityId: convertedOpportunity?.id || convertedOpportunity?.docId || null,
          accountId: payload.accountId || null,
          contactId: payload.contactId || null,
          convertedAt: new Date().toISOString(),
        },
      })

      await this.createActivity({
        leadId,
        opportunityId: convertedOpportunity?.id || convertedOpportunity?.docId || null,
        type: 'stage_change',
        subject: 'Lead converted',
        description: 'Lead converted into an opportunity.',
      }, currentUser)

      return {
        leadId,
        opportunity: convertedOpportunity,
      }
    },

    /**
     * Expose raw collections for advanced cases.
     */
    raw: {
      leads,
      opportunities,
      activities,
    },

    /**
     * Create a standalone id useful for external refs.
     * @param {'lead'|'opp'|'act'} prefix
     * @returns {string}
     */
    createId(prefix) {
      return createEntityId(prefix)
    },
  }
}

export default createCrmService
