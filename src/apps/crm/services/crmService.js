/**
 * @file apps/crm/services/crmService.js
 * @description Shared CRM service built for the latest Totistack root-store architecture.
 *
 * Design rules:
 * - The root store owns auth and RBAC.
 * - Collection actions come from the generated collection registry through the root store.
 * - This service stays module-local and does not create providers or stores.
 */

import { computed } from 'vue';
import { useAppStore } from '@app/stores/appStore/index.js';

/**
 * Stable collection names owned by the CRM app.
 */
export const CRM_COLLECTIONS = Object.freeze({
  leads: 'crm_leads',
  opportunities: 'crm_opportunities',
  activities: 'crm_activities',
});

/**
 * Default pipeline stages used by the starter CRM UI and services.
 */
export const CRM_PIPELINE_STAGES = Object.freeze([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);

/**
 * Normalize a value into a Date when possible.
 *
 * @param {unknown} value
 * @returns {Date|null}
 */
function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Create a title-cased full name.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function buildFullName(firstName = '', lastName = '') {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

/**
 * Build a human-friendly error with optional code.
 *
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {Error}
 */
function normalizeError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }

  const normalized = new Error(error?.message || fallbackMessage || 'CRM request failed.');
  if (error?.code) {
    normalized.code = error.code;
  }
  return normalized;
}

/**
 * Ensure a required collection action group exists.
 *
 * @param {ReturnType<typeof useAppStore>} store
 * @param {string} collectionName
 * @returns {any}
 */
function requireCollectionActions(store, collectionName) {
  const actions = store.getCollectionActions?.(collectionName) || store[`${collectionName}Actions`];

  if (!actions) {
    throw new Error(`CRM collection actions for "${collectionName}" are not available.`);
  }

  return actions;
}

/**
 * Create the CRM service bound to the root store.
 *
 * @param {ReturnType<typeof useAppStore>} [store]
 * @returns {object}
 */
export function createCrmService(store = useAppStore()) {
  const leadsActions = requireCollectionActions(store, CRM_COLLECTIONS.leads);
  const opportunitiesActions = requireCollectionActions(store, CRM_COLLECTIONS.opportunities);
  const activitiesActions = requireCollectionActions(store, CRM_COLLECTIONS.activities);

  /**
   * Guard access to write operations when RBAC is enabled.
   *
   * @param {string} permission
   * @returns {void}
   */
  function assertPermission(permission) {
    if (store.rbacEnabled?.value && typeof store.hasPermission === 'function' && !store.hasPermission(permission)) {
      const error = new Error(`Missing permission: ${permission}`);
      error.code = 'crm/forbidden';
      throw error;
    }
  }

  /**
   * Base lead payload with safe defaults.
   *
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildLeadPayload(payload = {}) {
    const now = new Date();
    const firstName = String(payload.firstName || '').trim();
    const lastName = String(payload.lastName || '').trim();

    if (!firstName || !lastName) {
      throw new Error('Lead first name and last name are required.');
    }

    return {
      firstName,
      lastName,
      fullName: buildFullName(firstName, lastName),
      email: String(payload.email || '').trim() || null,
      phone: String(payload.phone || '').trim() || null,
      company: String(payload.company || '').trim() || null,
      title: String(payload.title || '').trim() || null,
      source: payload.source || 'manual',
      status: payload.status || 'new',
      assignedTo: payload.assignedTo || store.currentUser?.value?.uid || null,
      score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : 0,
      tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : [],
      nextFollowUp: normalizeDate(payload.nextFollowUp),
      notes: String(payload.notes || '').trim() || null,
      lastActivityAt: now,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
    };
  }

  /**
   * Base opportunity payload with safe defaults.
   *
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildOpportunityPayload(payload = {}) {
    const now = new Date();
    const name = String(payload.name || '').trim();
    if (!name) {
      throw new Error('Opportunity name is required.');
    }

    const stage = payload.stage || 'prospecting';
    if (!CRM_PIPELINE_STAGES.includes(stage)) {
      throw new Error(`Unsupported opportunity stage: ${stage}`);
    }

    const amount = Number(payload.amount || 0);
    const probability = Number(payload.probability ?? 10);

    return {
      name,
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      amount: Number.isFinite(amount) ? amount : 0,
      currency: payload.currency || 'NAD',
      probability: Math.min(100, Math.max(0, Number.isFinite(probability) ? probability : 10)),
      expectedCloseDate: normalizeDate(payload.expectedCloseDate),
      actualCloseDate: normalizeDate(payload.actualCloseDate),
      stage,
      forecastCategory: payload.forecastCategory || 'pipeline',
      weightedAmount: Number.isFinite(amount) ? amount * ((Number.isFinite(probability) ? probability : 10) / 100) : 0,
      description: String(payload.description || '').trim() || null,
      nextSteps: String(payload.nextSteps || '').trim() || null,
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      lastActivityAt: now,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      closedAt: normalizeDate(payload.closedAt),
    };
  }

  /**
   * Base activity payload with safe defaults.
   *
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildActivityPayload(payload = {}) {
    const now = new Date();
    const subject = String(payload.subject || '').trim();
    if (!subject) {
      throw new Error('Activity subject is required.');
    }

    return {
      leadId: payload.leadId || null,
      opportunityId: payload.opportunityId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      type: payload.type || 'note',
      subtype: payload.subtype || null,
      subject,
      description: String(payload.description || '').trim() || null,
      duration: Number.isFinite(Number(payload.duration)) ? Number(payload.duration) : null,
      outcome: payload.outcome || 'completed',
      scheduledAt: normalizeDate(payload.scheduledAt),
      completedAt: normalizeDate(payload.completedAt) || now,
      assignedTo: payload.assignedTo || store.currentUser?.value?.uid || null,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      isPrivate: Boolean(payload.isPrivate),
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  async function fetchLeads(params = {}) {
    try {
      await leadsActions.fetchInitialPage(params);
      return store[CRM_COLLECTIONS.leads]?.value?.items || [];
    } catch (error) {
      throw normalizeError(error, 'Failed to load leads.');
    }
  }

  async function fetchLeadById(id) {
    try {
      return await leadsActions.getById(id);
    } catch (error) {
      throw normalizeError(error, 'Failed to load the lead.');
    }
  }

  async function createLead(payload) {
    assertPermission('crm:write');
    try {
      const lead = await leadsActions.add(buildLeadPayload(payload));
      await createActivity({
        leadId: lead?.id || null,
        type: 'lead_assign',
        subject: 'Lead created',
        description: `Lead ${buildFullName(payload?.firstName, payload?.lastName)} was created.`,
      });
      return lead;
    } catch (error) {
      throw normalizeError(error, 'Failed to create the lead.');
    }
  }

  async function updateLead(id, payload = {}) {
    assertPermission('crm:write');
    try {
      return await leadsActions.update(id, {
        ...payload,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw normalizeError(error, 'Failed to update the lead.');
    }
  }

  async function fetchOpportunities(params = {}) {
    try {
      await opportunitiesActions.fetchInitialPage(params);
      return store[CRM_COLLECTIONS.opportunities]?.value?.items || [];
    } catch (error) {
      throw normalizeError(error, 'Failed to load opportunities.');
    }
  }

  async function createOpportunity(payload) {
    assertPermission('crm:write');
    try {
      const opportunity = await opportunitiesActions.add(buildOpportunityPayload(payload));
      await createActivity({
        leadId: payload?.leadId || null,
        opportunityId: opportunity?.id || null,
        type: 'stage_change',
        subject: 'Opportunity created',
        description: `Opportunity ${opportunity?.name || payload?.name || ''} was created.`,
      });
      return opportunity;
    } catch (error) {
      throw normalizeError(error, 'Failed to create the opportunity.');
    }
  }

  async function moveOpportunityStage(id, stage) {
    assertPermission('crm:write');
    if (!CRM_PIPELINE_STAGES.includes(stage)) {
      throw new Error(`Unsupported opportunity stage: ${stage}`);
    }

    try {
      const current = await opportunitiesActions.getById(id);
      const updated = await opportunitiesActions.update(id, {
        stage,
        probability: stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 : current?.probability,
        actualCloseDate: stage === 'closed_won' || stage === 'closed_lost' ? new Date() : current?.actualCloseDate || null,
        closedAt: stage === 'closed_won' || stage === 'closed_lost' ? new Date() : null,
        updatedAt: new Date(),
      });

      await createActivity({
        opportunityId: id,
        type: 'stage_change',
        subject: 'Pipeline stage updated',
        description: `Opportunity moved to ${stage}.`,
      });

      return updated;
    } catch (error) {
      throw normalizeError(error, 'Failed to move the opportunity stage.');
    }
  }

  async function fetchActivities(params = {}) {
    try {
      await activitiesActions.fetchInitialPage(params);
      return store[CRM_COLLECTIONS.activities]?.value?.items || [];
    } catch (error) {
      throw normalizeError(error, 'Failed to load activities.');
    }
  }

  async function createActivity(payload) {
    assertPermission('crm:write');
    try {
      return await activitiesActions.add(buildActivityPayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the activity.');
    }
  }

  async function convertLeadToOpportunity(leadId, opportunityPayload = {}) {
    assertPermission('crm:write');
    try {
      const lead = await fetchLeadById(leadId);
      if (!lead) {
        throw new Error('Lead not found.');
      }

      const opportunity = await createOpportunity({
        name: opportunityPayload.name || `${lead.company || lead.fullName || 'Lead'} Opportunity`,
        leadId,
        amount: opportunityPayload.amount || 0,
        expectedCloseDate: opportunityPayload.expectedCloseDate || null,
        owner: opportunityPayload.owner || lead.assignedTo || store.currentUser?.value?.uid || null,
        description: opportunityPayload.description || `Converted from lead ${lead.fullName || ''}.`,
        ...opportunityPayload,
      });

      await updateLead(leadId, {
        status: 'converted',
        convertedOpportunityId: opportunity?.id || null,
      });

      return opportunity;
    } catch (error) {
      throw normalizeError(error, 'Failed to convert the lead.');
    }
  }

  async function fetchDashboardSnapshot() {
    const [leads, opportunities, activities] = await Promise.all([
      fetchLeads(),
      fetchOpportunities(),
      fetchActivities(),
    ]);

    const openPipelineAmount = opportunities
      .filter((item) => !['closed_won', 'closed_lost'].includes(item?.stage))
      .reduce((total, item) => total + Number(item?.weightedAmount || item?.amount || 0), 0);

    return {
      totals: {
        leads: leads.length,
        opportunities: opportunities.length,
        activities: activities.length,
        openPipelineAmount,
      },
      recentLeads: [...leads]
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
        .slice(0, 5),
      recentActivities: [...activities]
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
        .slice(0, 8),
      opportunitiesByStage: CRM_PIPELINE_STAGES.map((stage) => ({
        stage,
        items: opportunities.filter((item) => item?.stage === stage),
      })),
    };
  }

  return {
    collections: CRM_COLLECTIONS,
    pipelineStages: CRM_PIPELINE_STAGES,
    fetchLeads,
    fetchLeadById,
    createLead,
    updateLead,
    fetchOpportunities,
    createOpportunity,
    moveOpportunityStage,
    fetchActivities,
    createActivity,
    convertLeadToOpportunity,
    fetchDashboardSnapshot,
  };
}

/**
 * Small composition helper for Vue components.
 *
 * @returns {{ store: ReturnType<typeof useAppStore>, service: ReturnType<typeof createCrmService>, currentUser: import('vue').ComputedRef<any> }}
 */
export function useCrmService() {
  const store = useAppStore();
  const service = createCrmService(store);

  return {
    store,
    service,
    currentUser: computed(() => store.currentUser?.value || null),
  };
}

export default createCrmService;
