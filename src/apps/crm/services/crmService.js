/**
 * @file apps/crm/services/crmService.js
 * @description Shared CRM service built for the latest Totistack root-store architecture.
 *
 * Design rules:
 * - The root store owns auth and RBAC.
 * - Collection actions come from the generated collection registry through the root store.
 * - This service stays module-local and does not create providers or stores.
 * - New CRM modules are added without changing the working assembly structure.
 */

import { computed } from 'vue';
import { useAppStore } from '@app/stores/appStore/index.js';

/**
 * Stable collection names owned by the CRM app.
 */
export const CRM_COLLECTIONS = Object.freeze({
  leads: 'crm_leads',
  contacts: 'crm_contacts',
  accounts: 'crm_accounts',
  opportunities: 'crm_opportunities',
  tasks: 'crm_tasks',
  activities: 'crm_activities',
  notes: 'crm_notes',
  documents: 'crm_documents',
  messages: 'crm_messages',
  attachments: 'crm_attachments',
  savedViews: 'crm_saved_views',
  automationRules: 'crm_automation_rules',
  assignmentRules: 'crm_assignment_rules',
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
 * Document types supported by the CRM starter app.
 */
export const CRM_DOCUMENT_TYPES = Object.freeze(['quote', 'invoice', 'receipt']);

/**
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
 * @param {string} prefix
 * @returns {string}
 */
function createSequence(prefix) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

/**
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function buildFullName(firstName = '', lastName = '') {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

/**
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {Error}
 */
function normalizeError(error, fallbackMessage) {
  if (error instanceof Error) return error;

  const normalized = new Error(error?.message || fallbackMessage || 'CRM request failed.');
  if (error?.code) normalized.code = error.code;
  return normalized;
}

function normalizeFilters(filters = []) {
  if (Array.isArray(filters)) return filters;
  return Object.entries(filters || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([field, value]) => ({ field, op: "==", value }));
}

function normalizeFetchOptions(params = {}) {
  return {
    ...params,
    filters: normalizeFilters(params.filters),
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function asText(value) {
  return String(value || '').trim();
}

/**
 * @param {number|string|null|undefined} value
 * @returns {number}
 */
function asMoney(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

/**
 * @param {Record<string, any>} record
 * @param {string} query
 * @param {string[]} fields
 * @returns {boolean}
 */
function matchesQuery(record, query, fields) {
  const normalizedQuery = asText(query).toLowerCase();
  if (!normalizedQuery) return true;

  return fields.some((field) => String(record?.[field] || '').toLowerCase().includes(normalizedQuery));
}

/**
 * @param {Date|null} value
 * @returns {number}
 */
function toSortableDate(value) {
  return normalizeDate(value)?.getTime() || 0;
}

/**
 * @param {Record<string, any>} item
 * @param {string} idFallback
 * @returns {string}
 */
function getRecordId(item, idFallback = 'unknown') {
  return item?.id || item?.docId || item?._id || idFallback;
}

/**
 * @param {string} label
 * @param {Record<string, any>} item
 * @returns {Record<string, any>}
 */
function timelineEvent(label, item) {
  return {
    id: `${label}-${getRecordId(item)}`,
    entity: label,
    title:
      item?.title ||
      item?.subject ||
      item?.name ||
      item?.fileName ||
      item?.documentNumber ||
      item?.body ||
      'Untitled',
    description:
      item?.description ||
      item?.body ||
      item?.subject ||
      item?.status ||
      item?.channel ||
      '',
    status: item?.status || item?.outcome || item?.type || item?.channel || 'logged',
    owner: item?.owner || item?.assignedTo || item?.createdBy || item?.uploadedBy || null,
    relatedLeadId: item?.leadId || null,
    relatedContactId: item?.contactId || null,
    relatedAccountId: item?.accountId || null,
    relatedOpportunityId: item?.opportunityId || null,
    relatedTaskId: item?.taskId || null,
    createdAt:
      item?.createdAt ||
      item?.loggedAt ||
      item?.issuedAt ||
      item?.dueAt ||
      item?.completedAt ||
      null,
  };
}

/**
 * Create the CRM service bound to the root store.
 *
 * @param {ReturnType<typeof useAppStore>} [store]
 * @returns {object}
 */
export function createCrmService(context = {}) {
  const maybeStore = context?.store || context?.appStore || context?.provider?.store || context
  const store = maybeStore?.crm_leadsActions ? maybeStore : useAppStore()

  const actions = Object.freeze(
    Object.fromEntries(
      Object.values(CRM_COLLECTIONS).map((collectionName) => {
        const actionKey = `${collectionName}Actions`;
        const collectionActions = store?.[actionKey];
        if (!collectionActions || typeof collectionActions !== 'object') {
          throw new Error(`Missing root-store shard actions: store.${actionKey}`);
        }
        return [collectionName, collectionActions];
      }),
    ),
  );

  /**
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
   * @param {string} collectionName
   * @param {Record<string, any>} [params]
   * @returns {Promise<any[]>}
   */
  async function fetchCollection(collectionName, params = {}) {
    const collectionActions = actions[collectionName];
    await collectionActions.fetchInitialPage(normalizeFetchOptions(params));
    return store[collectionName]?.value?.items || [];
  }

  /**
   * @param {string} collectionName
   * @param {string} id
   * @returns {Promise<any>}
   */
  async function getById(collectionName, id) {
    return actions[collectionName].getById(id);
  }

  /**
   * @param {string} collectionName
   * @param {Record<string, any>} payload
   * @returns {Promise<any>}
   */
  async function add(collectionName, payload) {
    return actions[collectionName].add(payload);
  }

  /**
   * @param {string} collectionName
   * @param {string} id
   * @param {Record<string, any>} payload
   * @returns {Promise<any>}
   */
  async function update(collectionName, id, payload) {
    return actions[collectionName].update(id, payload);
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildLeadPayload(payload = {}) {
    const now = new Date();
    const firstName = asText(payload.firstName);
    const lastName = asText(payload.lastName);

    if (!firstName || !lastName) {
      throw new Error('Lead first name and last name are required.');
    }

    return {
      firstName,
      lastName,
      fullName: payload.fullName || buildFullName(firstName, lastName),
      email: asText(payload.email) || null,
      phone: asText(payload.phone) || null,
      company: asText(payload.company) || null,
      title: asText(payload.title) || null,
      source: payload.source || 'manual',
      status: payload.status || 'new',
      score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : 0,
      tags: asArray(payload.tags),
      assignedTo: payload.assignedTo || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      nextFollowUp: normalizeDate(payload.nextFollowUp),
      notes: asText(payload.notes) || null,
      convertedOpportunityId: payload.convertedOpportunityId || null,
      lastActivityAt: normalizeDate(payload.lastActivityAt) || now,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildContactPayload(payload = {}) {
    const now = new Date();
    const firstName = asText(payload.firstName);
    const lastName = asText(payload.lastName);

    if (!firstName || !lastName) {
      throw new Error('Contact first name and last name are required.');
    }

    return {
      firstName,
      lastName,
      fullName: payload.fullName || buildFullName(firstName, lastName),
      leadId: payload.leadId || null,
      accountId: payload.accountId || null,
      email: asText(payload.email) || null,
      phone: asText(payload.phone) || null,
      mobile: asText(payload.mobile) || null,
      role: asText(payload.role) || null,
      lifecycleStage: payload.lifecycleStage || 'prospect',
      status: payload.status || 'active',
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      tags: asArray(payload.tags),
      lastInteractionAt: normalizeDate(payload.lastInteractionAt) || now,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildAccountPayload(payload = {}) {
    const now = new Date();
    const name = asText(payload.name);
    if (!name) throw new Error('Account name is required.');

    return {
      name,
      accountNumber: payload.accountNumber || createSequence('ACC'),
      industry: asText(payload.industry) || null,
      website: asText(payload.website) || null,
      email: asText(payload.email) || null,
      phone: asText(payload.phone) || null,
      source: payload.source || 'manual',
      status: payload.status || 'active',
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      billingAddress: asText(payload.billingAddress) || null,
      shippingAddress: asText(payload.shippingAddress) || null,
      tags: asArray(payload.tags),
      lastInteractionAt: normalizeDate(payload.lastInteractionAt) || now,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildOpportunityPayload(payload = {}) {
    const now = new Date();
    const name = asText(payload.name);
    if (!name) throw new Error('Opportunity name is required.');

    const stage = payload.stage || 'prospecting';
    if (!CRM_PIPELINE_STAGES.includes(stage)) {
      throw new Error(`Unsupported opportunity stage: ${stage}`);
    }

    const amount = asMoney(payload.amount);
    const probability = Math.min(100, Math.max(0, Number(payload.probability ?? 10)));

    return {
      name,
      opportunityNumber: payload.opportunityNumber || createSequence('OPP'),
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      amount,
      currency: payload.currency || 'NAD',
      probability,
      expectedCloseDate: normalizeDate(payload.expectedCloseDate),
      actualCloseDate: normalizeDate(payload.actualCloseDate),
      stage,
      stageHistory: Array.isArray(payload.stageHistory)
        ? payload.stageHistory
        : [{ stage, changedAt: now, changedBy: store.currentUser?.value?.uid || null }],
      forecastCategory: payload.forecastCategory || 'pipeline',
      weightedAmount: amount * (probability / 100),
      description: asText(payload.description) || null,
      nextSteps: asText(payload.nextSteps) || null,
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      lastActivityAt: normalizeDate(payload.lastActivityAt) || now,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      closedAt: normalizeDate(payload.closedAt),
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildTaskPayload(payload = {}) {
    const now = new Date();
    const title = asText(payload.title);
    if (!title) throw new Error('Task title is required.');

    return {
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      opportunityId: payload.opportunityId || null,
      title,
      description: asText(payload.description) || null,
      type: payload.type || 'follow_up',
      status: payload.status || 'open',
      priority: payload.priority || 'medium',
      dueAt: normalizeDate(payload.dueAt),
      reminderAt: normalizeDate(payload.reminderAt),
      completedAt: normalizeDate(payload.completedAt),
      assignedTo: payload.assignedTo || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      isFollowUp: payload.isFollowUp !== false,
      automationRuleId: payload.automationRuleId || null,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildActivityPayload(payload = {}) {
    const now = new Date();
    const subject = asText(payload.subject);
    if (!subject) throw new Error('Activity subject is required.');

    return {
      leadId: payload.leadId || null,
      opportunityId: payload.opportunityId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      type: payload.type || 'note',
      subtype: payload.subtype || null,
      subject,
      description: asText(payload.description) || null,
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

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildNotePayload(payload = {}) {
    const now = new Date();
    const body = asText(payload.body);
    if (!body) throw new Error('Note body is required.');

    return {
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      opportunityId: payload.opportunityId || null,
      taskId: payload.taskId || null,
      title: asText(payload.title) || null,
      body,
      visibility: payload.visibility || 'internal',
      pinned: Boolean(payload.pinned),
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      assignedTo: payload.assignedTo || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildDocumentPayload(payload = {}) {
    const now = new Date();
    const documentType = payload.documentType || 'quote';
    if (!CRM_DOCUMENT_TYPES.includes(documentType)) {
      throw new Error(`Unsupported document type: ${documentType}`);
    }

    const title = asText(payload.title) || `${documentType.toUpperCase()} for customer`;
    const subtotal = asMoney(payload.subtotal || payload.totalAmount);
    const taxAmount = asMoney(payload.taxAmount);
    const totalAmount = asMoney(payload.totalAmount || subtotal + taxAmount);
    const lineItems = Array.isArray(payload.lineItems) && payload.lineItems.length > 0
      ? payload.lineItems
      : [
          {
            name: 'Starter service package',
            quantity: 1,
            unitPrice: totalAmount,
            total: totalAmount,
          },
        ];

    const customerName =
      asText(payload.customerName) ||
      asText(payload.accountName) ||
      asText(payload.contactName) ||
      'Customer Name';

    return {
      documentType,
      documentNumber: payload.documentNumber || createSequence(documentType.slice(0, 3).toUpperCase()),
      title,
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      opportunityId: payload.opportunityId || null,
      status: payload.status || (documentType === 'receipt' ? 'issued' : 'draft'),
      currency: payload.currency || 'NAD',
      subtotal,
      taxAmount,
      totalAmount,
      issuedAt: normalizeDate(payload.issuedAt) || now,
      dueAt: normalizeDate(payload.dueAt),
      paidAt: normalizeDate(payload.paidAt),
      templateKey: payload.templateKey || `${documentType}-default`,
      lineItems,
      generatedByPackage: payload.generatedByPackage || '@xbensommo/doc-generator',
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      placeholderPayload: payload.placeholderPayload || {
        issuer: {
          businessName: 'Your Business Name',
          email: 'billing@example.com',
          phone: '+264 81 000 0000',
        },
        customer: {
          name: customerName,
          email: asText(payload.customerEmail) || 'customer@example.com',
          phone: asText(payload.customerPhone) || '+264 81 000 0001',
        },
        summary: {
          title,
          note: 'Placeholder payload ready for the real document generator package.',
          totalAmount,
          currency: payload.currency || 'NAD',
        },
        lineItems,
      },
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildMessagePayload(payload = {}) {
    const now = new Date();
    const body = asText(payload.body);
    if (!body) throw new Error('Message body is required.');

    return {
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      opportunityId: payload.opportunityId || null,
      channel: payload.channel || 'whatsapp',
      direction: payload.direction || 'outbound',
      subject: asText(payload.subject) || null,
      body,
      to: asText(payload.to) || null,
      from: asText(payload.from) || null,
      status: payload.status || 'logged',
      providerMessageId: asText(payload.providerMessageId) || null,
      loggedAt: normalizeDate(payload.loggedAt) || now,
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildAttachmentPayload(payload = {}) {
    const now = new Date();
    const fileName = asText(payload.fileName);
    if (!fileName) throw new Error('Attachment file name is required.');

    return {
      leadId: payload.leadId || null,
      contactId: payload.contactId || null,
      accountId: payload.accountId || null,
      opportunityId: payload.opportunityId || null,
      taskId: payload.taskId || null,
      documentId: payload.documentId || null,
      fileName,
      fileType: payload.fileType || 'application/pdf',
      fileSize: Number(payload.fileSize || 0),
      storagePath: asText(payload.storagePath) || `/crm/attachments/${fileName}`,
      downloadUrl: asText(payload.downloadUrl) || null,
      visibility: payload.visibility || 'internal',
      uploadedBy: payload.uploadedBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildSavedViewPayload(payload = {}) {
    const now = new Date();
    const name = asText(payload.name);
    const module = asText(payload.module);
    if (!name || !module) throw new Error('Saved view name and module are required.');

    return {
      module,
      name,
      query: asText(payload.query) || null,
      filters: payload.filters || {},
      sort: payload.sort || { field: 'createdAt', direction: 'desc' },
      visibility: payload.visibility || 'private',
      isDefault: Boolean(payload.isDefault),
      owner: payload.owner || store.currentUser?.value?.uid || null,
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildAutomationRulePayload(payload = {}) {
    const now = new Date();
    const name = asText(payload.name);
    const targetModule = asText(payload.targetModule);
    const triggerEvent = asText(payload.triggerEvent);
    if (!name || !targetModule || !triggerEvent) {
      throw new Error('Automation rule name, target module, and trigger event are required.');
    }

    return {
      name,
      targetModule,
      triggerEvent,
      enabled: payload.enabled !== false,
      conditions: Array.isArray(payload.conditions) ? payload.conditions : [],
      actions: Array.isArray(payload.actions) ? payload.actions : [],
      owner: payload.owner || store.currentUser?.value?.uid || null,
      team: payload.team || null,
      runCount: Number(payload.runCount || 0),
      lastRunAt: normalizeDate(payload.lastRunAt),
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @param {Record<string, any>} payload
   * @returns {Record<string, any>}
   */
  function buildAssignmentRulePayload(payload = {}) {
    const now = new Date();
    const name = asText(payload.name);
    const targetModule = asText(payload.targetModule);
    if (!name || !targetModule) {
      throw new Error('Assignment rule name and target module are required.');
    }

    return {
      name,
      targetModule,
      enabled: payload.enabled !== false,
      ownershipMode: payload.ownershipMode || 'direct',
      assignTo: payload.assignTo || store.currentUser?.value?.uid || null,
      assignTeam: payload.assignTeam || null,
      roundRobinKey: payload.roundRobinKey || null,
      conditions: Array.isArray(payload.conditions) ? payload.conditions : [],
      createdBy: payload.createdBy || store.currentUser?.value?.uid || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  async function fetchLeads(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.leads, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load leads.');
    }
  }

  async function fetchLeadById(id) {
    try {
      return await getById(CRM_COLLECTIONS.leads, id);
    } catch (error) {
      throw normalizeError(error, 'Failed to load the lead.');
    }
  }

  async function createLead(payload) {
    assertPermission('crm:write');
    try {
      const lead = await add(CRM_COLLECTIONS.leads, buildLeadPayload(payload));
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
      return await update(CRM_COLLECTIONS.leads, id, { ...payload, updatedAt: new Date() });
    } catch (error) {
      throw normalizeError(error, 'Failed to update the lead.');
    }
  }

  async function fetchContacts(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.contacts, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load contacts.');
    }
  }

  async function createContact(payload) {
    assertPermission('crm:write');
    try {
      const contact = await add(CRM_COLLECTIONS.contacts, buildContactPayload(payload));
      await createActivity({
        contactId: contact?.id || null,
        accountId: payload?.accountId || null,
        leadId: payload?.leadId || null,
        type: 'contact_created',
        subject: 'Contact created',
        description: `Contact ${buildFullName(payload?.firstName, payload?.lastName)} was added.`,
      });
      return contact;
    } catch (error) {
      throw normalizeError(error, 'Failed to create the contact.');
    }
  }

  async function updateContact(id, payload = {}) {
    assertPermission('crm:write');
    try {
      return await update(CRM_COLLECTIONS.contacts, id, { ...payload, updatedAt: new Date() });
    } catch (error) {
      throw normalizeError(error, 'Failed to update the contact.');
    }
  }

  async function fetchAccounts(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.accounts, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load accounts.');
    }
  }

  async function createAccount(payload) {
    assertPermission('crm:write');
    try {
      const account = await add(CRM_COLLECTIONS.accounts, buildAccountPayload(payload));
      await createActivity({
        accountId: account?.id || null,
        type: 'account_created',
        subject: 'Account created',
        description: `Account ${payload?.name || account?.name || ''} was created.`,
      });
      return account;
    } catch (error) {
      throw normalizeError(error, 'Failed to create the account.');
    }
  }

  async function updateAccount(id, payload = {}) {
    assertPermission('crm:write');
    try {
      return await update(CRM_COLLECTIONS.accounts, id, { ...payload, updatedAt: new Date() });
    } catch (error) {
      throw normalizeError(error, 'Failed to update the account.');
    }
  }

  async function fetchOpportunities(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.opportunities, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load opportunities.');
    }
  }

  async function createOpportunity(payload) {
    assertPermission('crm:write');
    try {
      const opportunity = await add(CRM_COLLECTIONS.opportunities, buildOpportunityPayload(payload));
      await createActivity({
        leadId: payload?.leadId || null,
        contactId: payload?.contactId || null,
        accountId: payload?.accountId || null,
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
      const current = await getById(CRM_COLLECTIONS.opportunities, id);
      const stageHistory = Array.isArray(current?.stageHistory) ? [...current.stageHistory] : [];
      stageHistory.push({
        stage,
        changedAt: new Date(),
        changedBy: store.currentUser?.value?.uid || null,
      });

      const updated = await update(CRM_COLLECTIONS.opportunities, id, {
        stage,
        probability: stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 : current?.probability,
        actualCloseDate: stage === 'closed_won' || stage === 'closed_lost' ? new Date() : current?.actualCloseDate || null,
        closedAt: stage === 'closed_won' || stage === 'closed_lost' ? new Date() : null,
        stageHistory,
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

  async function fetchTasks(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.tasks, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load tasks.');
    }
  }

  async function createTask(payload) {
    assertPermission('crm:write');
    try {
      const task = await add(CRM_COLLECTIONS.tasks, buildTaskPayload(payload));
      await createActivity({
        leadId: payload?.leadId || null,
        contactId: payload?.contactId || null,
        accountId: payload?.accountId || null,
        opportunityId: payload?.opportunityId || null,
        type: 'task_created',
        subject: 'Task created',
        description: payload?.title || 'Task created.',
      });
      return task;
    } catch (error) {
      throw normalizeError(error, 'Failed to create the task.');
    }
  }

  async function updateTask(id, payload = {}) {
    assertPermission('crm:write');
    try {
      return await update(CRM_COLLECTIONS.tasks, id, { ...payload, updatedAt: new Date() });
    } catch (error) {
      throw normalizeError(error, 'Failed to update the task.');
    }
  }

  async function completeTask(id) {
    assertPermission('crm:write');
    try {
      const task = await getById(CRM_COLLECTIONS.tasks, id);
      const updated = await updateTask(id, {
        status: 'completed',
        completedAt: new Date(),
      });

      await createActivity({
        leadId: task?.leadId || null,
        contactId: task?.contactId || null,
        accountId: task?.accountId || null,
        opportunityId: task?.opportunityId || null,
        type: 'task_completed',
        subject: 'Task completed',
        description: task?.title || 'Task completed.',
      });

      return updated;
    } catch (error) {
      throw normalizeError(error, 'Failed to complete the task.');
    }
  }

  async function fetchActivities(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.activities, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load activities.');
    }
  }

  async function createActivity(payload) {
    assertPermission('crm:write');
    try {
      return await add(CRM_COLLECTIONS.activities, buildActivityPayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the activity.');
    }
  }

  async function fetchNotes(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.notes, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load notes.');
    }
  }

  async function createNote(payload) {
    assertPermission('crm:write');
    try {
      return await add(CRM_COLLECTIONS.notes, buildNotePayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the note.');
    }
  }

  async function fetchDocuments(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.documents, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load documents.');
    }
  }

  async function createDocument(payload) {
    assertPermission('crm:write');
    try {
      const document = await add(CRM_COLLECTIONS.documents, buildDocumentPayload(payload));
      await createActivity({
        leadId: payload?.leadId || null,
        contactId: payload?.contactId || null,
        accountId: payload?.accountId || null,
        opportunityId: payload?.opportunityId || null,
        type: 'document_created',
        subject: `${document?.documentType || payload?.documentType || 'Document'} created`,
        description: document?.documentNumber || document?.title || 'Document created.',
      });
      return document;
    } catch (error) {
      throw normalizeError(error, 'Failed to create the document.');
    }
  }

  async function fetchMessages(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.messages, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load messages.');
    }
  }

  async function logMessage(payload) {
    assertPermission('crm:write');
    try {
      const message = await add(CRM_COLLECTIONS.messages, buildMessagePayload(payload));
      await createActivity({
        leadId: payload?.leadId || null,
        contactId: payload?.contactId || null,
        accountId: payload?.accountId || null,
        opportunityId: payload?.opportunityId || null,
        type: 'communication_logged',
        subject: `${payload?.channel || 'Message'} logged`,
        description: asText(payload?.subject) || asText(payload?.body) || 'Communication logged.',
      });
      return message;
    } catch (error) {
      throw normalizeError(error, 'Failed to log the message.');
    }
  }

  async function fetchAttachments(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.attachments, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load attachments.');
    }
  }

  async function createAttachment(payload) {
    assertPermission('crm:write');
    try {
      return await add(CRM_COLLECTIONS.attachments, buildAttachmentPayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the attachment metadata.');
    }
  }

  async function fetchSavedViews(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.savedViews, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load saved views.');
    }
  }

  async function createSavedView(payload) {
    assertPermission('crm:write');
    try {
      return await add(CRM_COLLECTIONS.savedViews, buildSavedViewPayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the saved view.');
    }
  }

  async function fetchAutomationRules(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.automationRules, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load automation rules.');
    }
  }

  async function createAutomationRule(payload) {
    assertPermission('crm:write');
    try {
      return await add(CRM_COLLECTIONS.automationRules, buildAutomationRulePayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the automation rule.');
    }
  }

  async function fetchAssignmentRules(params = {}) {
    try {
      return await fetchCollection(CRM_COLLECTIONS.assignmentRules, params);
    } catch (error) {
      throw normalizeError(error, 'Failed to load assignment rules.');
    }
  }

  async function createAssignmentRule(payload) {
    assertPermission('crm:write');
    try {
      return await add(CRM_COLLECTIONS.assignmentRules, buildAssignmentRulePayload(payload));
    } catch (error) {
      throw normalizeError(error, 'Failed to create the assignment rule.');
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

  async function fetchRecordTimeline(filters = {}) {
    const [activities, notes, messages, documents, tasks, attachments] = await Promise.all([
      fetchActivities(filters),
      fetchNotes(filters),
      fetchMessages(filters),
      fetchDocuments(filters),
      fetchTasks(filters),
      fetchAttachments(filters),
    ]);

    const filtered = [
      ...activities.map((item) => timelineEvent('activity', item)),
      ...notes.map((item) => timelineEvent('note', item)),
      ...messages.map((item) => timelineEvent('message', item)),
      ...documents.map((item) => timelineEvent('document', item)),
      ...tasks.map((item) => timelineEvent('task', item)),
      ...attachments.map((item) => timelineEvent('attachment', item)),
    ].filter((event) => {
      if (filters.leadId && event.relatedLeadId !== filters.leadId) return false;
      if (filters.contactId && event.relatedContactId !== filters.contactId) return false;
      if (filters.accountId && event.relatedAccountId !== filters.accountId) return false;
      if (filters.opportunityId && event.relatedOpportunityId !== filters.opportunityId) return false;
      return true;
    });

    return filtered.sort((a, b) => toSortableDate(b.createdAt) - toSortableDate(a.createdAt));
  }

  async function fetchLeadWorkspace(leadId) {
    const [lead, timeline, tasks, documents, messages] = await Promise.all([
      fetchLeadById(leadId),
      fetchRecordTimeline({ leadId }),
      fetchTasks({}),
      fetchDocuments({}),
      fetchMessages({}),
    ]);

    return {
      lead,
      timeline,
      tasks: tasks.filter((item) => item?.leadId === leadId),
      documents: documents.filter((item) => item?.leadId === leadId),
      messages: messages.filter((item) => item?.leadId === leadId),
    };
  }

  async function searchEverything(query, options = {}) {
    const [leads, contacts, accounts, opportunities, tasks, documents, messages] = await Promise.all([
      fetchLeads(options),
      fetchContacts(options),
      fetchAccounts(options),
      fetchOpportunities(options),
      fetchTasks(options),
      fetchDocuments(options),
      fetchMessages(options),
    ]);

    const results = [
      ...leads
        .filter((item) => matchesQuery(item, query, ['firstName', 'lastName', 'fullName', 'email', 'company']))
        .map((item) => ({ id: getRecordId(item), module: 'lead', title: item.fullName, subtitle: item.company || item.email || '', status: item.status || 'new' })),
      ...contacts
        .filter((item) => matchesQuery(item, query, ['firstName', 'lastName', 'fullName', 'email', 'role']))
        .map((item) => ({ id: getRecordId(item), module: 'contact', title: item.fullName, subtitle: item.role || item.email || '', status: item.status || 'active' })),
      ...accounts
        .filter((item) => matchesQuery(item, query, ['name', 'accountNumber', 'industry', 'email']))
        .map((item) => ({ id: getRecordId(item), module: 'account', title: item.name, subtitle: item.industry || item.email || '', status: item.status || 'active' })),
      ...opportunities
        .filter((item) => matchesQuery(item, query, ['name', 'opportunityNumber', 'description', 'nextSteps']))
        .map((item) => ({ id: getRecordId(item), module: 'opportunity', title: item.name, subtitle: item.opportunityNumber || '', status: item.stage || 'prospecting' })),
      ...tasks
        .filter((item) => matchesQuery(item, query, ['title', 'description']))
        .map((item) => ({ id: getRecordId(item), module: 'task', title: item.title, subtitle: item.description || '', status: item.status || 'open' })),
      ...documents
        .filter((item) => matchesQuery(item, query, ['title', 'documentNumber']))
        .map((item) => ({ id: getRecordId(item), module: 'document', title: item.title, subtitle: item.documentNumber || '', status: item.status || 'draft' })),
      ...messages
        .filter((item) => matchesQuery(item, query, ['subject', 'body', 'to', 'from']))
        .map((item) => ({ id: getRecordId(item), module: 'message', title: item.subject || item.channel || 'Message', subtitle: item.to || item.from || '', status: item.status || 'logged' })),
    ];

    return results.sort((a, b) => a.module.localeCompare(b.module));
  }

  async function fetchCustomerRecordsSnapshot() {
    const [leads, contacts, accounts, opportunities, timeline] = await Promise.all([
      fetchLeads(),
      fetchContacts(),
      fetchAccounts(),
      fetchOpportunities(),
      fetchRecordTimeline(),
    ]);

    return {
      leads,
      contacts,
      accounts,
      opportunities,
      timeline: timeline.slice(0, 25),
    };
  }

  async function fetchDashboardSnapshot() {
    const [leads, contacts, accounts, opportunities, tasks, activities] = await Promise.all([
      fetchLeads(),
      fetchContacts(),
      fetchAccounts(),
      fetchOpportunities(),
      fetchTasks(),
      fetchActivities(),
    ]);

    const openPipelineAmount = opportunities
      .filter((item) => !['closed_won', 'closed_lost'].includes(item?.stage))
      .reduce((total, item) => total + Number(item?.weightedAmount || item?.amount || 0), 0);

    return {
      totals: {
        leads: leads.length,
        contacts: contacts.length,
        accounts: accounts.length,
        opportunities: opportunities.length,
        tasks: tasks.length,
        activities: activities.length,
        openPipelineAmount,
      },
      recentLeads: [...leads].sort((a, b) => toSortableDate(b?.createdAt) - toSortableDate(a?.createdAt)).slice(0, 5),
      recentActivities: [...activities].sort((a, b) => toSortableDate(b?.createdAt) - toSortableDate(a?.createdAt)).slice(0, 8),
      opportunitiesByStage: CRM_PIPELINE_STAGES.map((stage) => ({
        stage,
        items: opportunities.filter((item) => item?.stage === stage),
      })),
    };
  }

  async function fetchReportsSnapshot() {
    const [leads, contacts, accounts, opportunities, tasks, documents, messages, automationRules, assignmentRules] = await Promise.all([
      fetchLeads(),
      fetchContacts(),
      fetchAccounts(),
      fetchOpportunities(),
      fetchTasks(),
      fetchDocuments(),
      fetchMessages(),
      fetchAutomationRules(),
      fetchAssignmentRules(),
    ]);

    const wonDeals = opportunities.filter((item) => item?.stage === 'closed_won');
    const lostDeals = opportunities.filter((item) => item?.stage === 'closed_lost');
    const totalWonAmount = wonDeals.reduce((total, item) => total + asMoney(item?.amount), 0);
    const openTasks = tasks.filter((item) => item?.status !== 'completed').length;
    const overdueTasks = tasks.filter((item) => item?.status !== 'completed' && toSortableDate(item?.dueAt) < Date.now()).length;
    const documentsByType = CRM_DOCUMENT_TYPES.map((type) => ({
      type,
      count: documents.filter((item) => item?.documentType === type).length,
    }));
    const communicationsByChannel = ['whatsapp', 'email', 'call'].map((channel) => ({
      channel,
      count: messages.filter((item) => item?.channel === channel).length,
    }));

    const ownerCounts = {};
    [...leads, ...contacts, ...accounts, ...opportunities, ...tasks].forEach((item) => {
      const owner = item?.owner || item?.assignedTo || 'unassigned';
      ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
    });

    return {
      totals: {
        leads: leads.length,
        contacts: contacts.length,
        accounts: accounts.length,
        opportunities: opportunities.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        openTasks,
        overdueTasks,
        totalWonAmount,
        documents: documents.length,
        messages: messages.length,
        automationRules: automationRules.length,
        assignmentRules: assignmentRules.length,
      },
      documentsByType,
      communicationsByChannel,
      ownerWorkload: Object.entries(ownerCounts)
        .map(([owner, count]) => ({ owner, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  return {
    collections: CRM_COLLECTIONS,
    pipelineStages: CRM_PIPELINE_STAGES,
    documentTypes: CRM_DOCUMENT_TYPES,
    fetchLeads,
    fetchLeadById,
    createLead,
    updateLead,
    fetchContacts,
    createContact,
    updateContact,
    fetchAccounts,
    createAccount,
    updateAccount,
    fetchOpportunities,
    createOpportunity,
    moveOpportunityStage,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    fetchActivities,
    createActivity,
    fetchNotes,
    createNote,
    fetchDocuments,
    createDocument,
    fetchMessages,
    logMessage,
    fetchAttachments,
    createAttachment,
    fetchSavedViews,
    createSavedView,
    fetchAutomationRules,
    createAutomationRule,
    fetchAssignmentRules,
    createAssignmentRule,
    convertLeadToOpportunity,
    fetchRecordTimeline,
    fetchLeadWorkspace,
    fetchCustomerRecordsSnapshot,
    searchEverything,
    fetchDashboardSnapshot,
    fetchReportsSnapshot,
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
