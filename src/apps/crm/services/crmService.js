/**
 * CRM Service
 * @module apps/crm/services/crmService
 * @description Core CRM service for managing leads, contacts, opportunities, and activities
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch, runTransaction } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * CRM Service Class
 */
export class CrmService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Features context */
  #features = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Cache */
  #cache = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {CrmService} CrmService instance
   */
  static getInstance() {
    if (!globalThis.__crmService) {
      globalThis.__crmService = new CrmService();
    }
    return globalThis.__crmService;
  }
  
  /**
   * Initialize CRM service
   * @param {Object} config - Configuration
   * @param {Object} features - Features context
   * @returns {Promise<void>}
   */
  async initialize(config = {}, features) {
    if (this.#initialized) return;
    
    try {
      this.#features = features;
      this.#config = {
        leadPrefix: 'LEAD',
        opportunityPrefix: 'OPP',
        defaultLeadStatus: 'new',
        leadScoringEnabled: true,
        ...config
      };
      
      this.#initialized = true;
      console.info('[CrmService] Initialized');
      
    } catch (error) {
      console.error('[CrmService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create lead
   * @param {Object} leadData - Lead information
   * @returns {Promise<Object>} Created lead
   */
  async createLead(leadData) {
    try {
      const user = this.#features.auth.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const leadId = this.#generateId('lead');
      const now = Timestamp.now();
      const leadNumber = await this.#generateLeadNumber();
      
      const lead = {
        id: leadId,
        leadNumber,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        title: leadData.title,
        website: leadData.website,
        source: leadData.source || 'other',
        status: this.#config.defaultLeadStatus,
        qualification: {
          budget: 'unknown',
          authority: 'unknown',
          need: 'unknown',
          timeline: 'unknown',
          ...leadData.qualification
        },
        score: {
          total: 0,
          fit: 0,
          engagement: 0,
          behavior: 0
        },
        tags: leadData.tags || [],
        notes: [],
        assignedTo: leadData.assignedTo || null,
        assignedTeam: leadData.assignedTeam || null,
        lastActivityAt: now,
        nextFollowUp: leadData.nextFollowUp ? Timestamp.fromDate(new Date(leadData.nextFollowUp)) : null,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid
      };
      
      // Validate email uniqueness
      if (lead.email) {
        await this.#validateEmailUniqueness(lead.email, 'crm_leads');
      }
      
      const leadRef = doc(this.#db, 'crm_leads', leadId);
      await setDoc(leadRef, lead);
      
      // Calculate initial lead score
      if (this.#config.leadScoringEnabled) {
        const leadScoring = await import('./leadScoringService');
        await leadScoring.default.calculateScore(leadId);
      }
      
      // Create activity
      await this.createActivity({
        leadId,
        type: 'lead_assign',
        subject: 'Lead created',
        description: `Lead ${lead.firstName} ${lead.lastName} created`,
        assignedTo: lead.assignedTo,
        createdAt: now
      });
      
      // Index for search
      if (this.#features.search) {
        await this.#features.search.indexDocument('crm_leads', leadId, lead);
      }
      
      this.#cache.set(leadId, lead);
      
      console.info(`[CrmService] Lead created: ${leadNumber}`);
      
      return lead;
      
    } catch (error) {
      console.error('[CrmService] Create lead failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Convert lead to contact and opportunity
   * @param {string} leadId - Lead ID
   * @param {Object} conversionData - Conversion data
   * @returns {Promise<Object>} Conversion result
   */
  async convertLead(leadId, conversionData = {}) {
    try {
      const user = this.#features.auth.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const lead = await this.getLead(leadId);
      if (!lead) throw new Error('LEAD_NOT_FOUND');
      
      if (lead.status === 'converted') {
        throw new Error('LEAD_ALREADY_CONVERTED');
      }
      
      const now = Timestamp.now();
      
      // Create contact
      const contact = {
        id: this.#generateId('contact'),
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        title: lead.title,
        company: lead.company,
        source: lead.source,
        status: 'active',
        leadId: lead.id,
        tags: lead.tags,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid
      };
      
      const contactRef = doc(this.#db, 'crm_contacts', contact.id);
      await setDoc(contactRef, contact);
      
      // Create account if company exists
      let accountId = null;
      if (lead.company && conversionData.createAccount !== false) {
        const account = {
          id: this.#generateId('account'),
          name: lead.company,
          website: lead.website,
          type: 'customer',
          status: 'active',
          createdAt: now,
          updatedAt: now,
          createdBy: user.uid
        };
        
        const accountRef = doc(this.#db, 'crm_accounts', account.id);
        await setDoc(accountRef, account);
        accountId = account.id;
      }
      
      // Create opportunity
      const opportunity = null;
      if (conversionData.createOpportunity) {
        const opportunityData = {
          name: conversionData.opportunityName || `Opportunity for ${lead.company || lead.fullName}`,
          leadId: lead.id,
          contactId: contact.id,
          accountId,
          amount: conversionData.amount || 0,
          probability: 10,
          expectedCloseDate: conversionData.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stage: 'prospecting',
          owner: user.uid,
          ...conversionData
        };
        
        const createdOpportunity = await this.createOpportunity(opportunityData);
        opportunity.id = createdOpportunity.id;
      }
      
      // Update lead status
      const leadRef = doc(this.#db, 'crm_leads', leadId);
      await updateDoc(leadRef, {
        status: 'converted',
        convertedTo: {
          contactId: contact.id,
          accountId,
          opportunityId: opportunity?.id,
          convertedAt: now
        },
        updatedAt: now
      });
      
      // Create conversion activity
      await this.createActivity({
        leadId,
        contactId: contact.id,
        accountId,
        opportunityId: opportunity?.id,
        type: 'note',
        subject: 'Lead converted',
        description: `Lead converted to contact and ${opportunity ? 'opportunity' : 'account'}`,
        createdAt: now
      });
      
      // Index for search
      if (this.#features.search) {
        await this.#features.search.indexDocument('crm_contacts', contact.id, contact);
        if (accountId) {
          const account = await getDoc(doc(this.#db, 'crm_accounts', accountId));
          await this.#features.search.indexDocument('crm_accounts', accountId, account.data());
        }
      }
      
      this.#cache.delete(leadId);
      
      console.info(`[CrmService] Lead converted: ${lead.leadNumber}`);
      
      return {
        lead: { ...lead, status: 'converted' },
        contact,
        account: accountId ? { id: accountId } : null,
        opportunity
      };
      
    } catch (error) {
      console.error('[CrmService] Convert lead failed:', error);
      throw error;
    }
  }
  
  /**
   * Create opportunity
   * @param {Object} opportunityData - Opportunity data
   * @returns {Promise<Object>} Created opportunity
   */
  async createOpportunity(opportunityData) {
    try {
      const user = this.#features.auth.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const opportunityId = this.#generateId('opp');
      const now = Timestamp.now();
      const opportunityNumber = await this.#generateOpportunityNumber();
      
      const opportunity = {
        id: opportunityId,
        name: opportunityData.name,
        opportunityNumber,
        leadId: opportunityData.leadId || null,
        contactId: opportunityData.contactId,
        accountId: opportunityData.accountId || null,
        amount: opportunityData.amount,
        currency: opportunityData.currency || 'USD',
        probability: opportunityData.probability || 10,
        expectedCloseDate: Timestamp.fromDate(new Date(opportunityData.expectedCloseDate)),
        stage: opportunityData.stage || 'prospecting',
        stageHistory: [{
          stage: opportunityData.stage || 'prospecting',
          enteredAt: now,
          duration: 0
        }],
        forecastCategory: opportunityData.forecastCategory || 'pipeline',
        weightedAmount: opportunityData.amount * (opportunityData.probability || 10) / 100,
        lineItems: opportunityData.lineItems || [],
        competitors: opportunityData.competitors || [],
        decisionCriteria: opportunityData.decisionCriteria,
        nextSteps: opportunityData.nextSteps,
        owner: opportunityData.owner || user.uid,
        team: opportunityData.team || null,
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now
      };
      
      const opportunityRef = doc(this.#db, 'crm_opportunities', opportunityId);
      await setDoc(opportunityRef, opportunity);
      
      // Create activity
      await this.createActivity({
        opportunityId,
        type: 'note',
        subject: 'Opportunity created',
        description: `Opportunity ${opportunity.name} created with amount ${opportunity.amount}`,
        createdAt: now
      });
      
      // Index for search
      if (this.#features.search) {
        await this.#features.search.indexDocument('crm_opportunities', opportunityId, opportunity);
      }
      
      console.info(`[CrmService] Opportunity created: ${opportunityNumber}`);
      
      return opportunity;
      
    } catch (error) {
      console.error('[CrmService] Create opportunity failed:', error);
      throw error;
    }
  }
  
  /**
   * Create activity
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity
   */
  async createActivity(activityData) {
    try {
      const user = this.#features.auth.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const activityId = this.#generateId('act');
      const now = Timestamp.now();
      
      const activity = {
        id: activityId,
        leadId: activityData.leadId || null,
        contactId: activityData.contactId || null,
        accountId: activityData.accountId || null,
        opportunityId: activityData.opportunityId || null,
        type: activityData.type,
        subtype: activityData.subtype || null,
        subject: activityData.subject,
        description: activityData.description || '',
        duration: activityData.duration || null,
        outcome: activityData.outcome || 'completed',
        communication: activityData.communication || null,
        attachments: activityData.attachments || [],
        scheduledAt: activityData.scheduledAt ? Timestamp.fromDate(new Date(activityData.scheduledAt)) : null,
        completedAt: activityData.completedAt ? Timestamp.fromDate(new Date(activityData.completedAt)) : now,
        assignedTo: activityData.assignedTo || null,
        createdBy: user.uid,
        isPrivate: activityData.isPrivate || false,
        createdAt: now,
        updatedAt: now
      };
      
      const activityRef = doc(this.#db, 'crm_activities', activityId);
      await setDoc(activityRef, activity);
      
      // Update last activity on parent entities
      await this.#updateParentLastActivity(activity);
      
      // Update lead score if applicable
      if (activity.leadId && this.#config.leadScoringEnabled) {
        const leadScoring = await import('./leadScoringService');
        await leadScoring.default.updateScoreFromActivity(activity.leadId, activity);
      }
      
      console.debug(`[CrmService] Activity created: ${activity.type} - ${activity.subject}`);
      
      return activity;
      
    } catch (error) {
      console.error('[CrmService] Create activity failed:', error);
      throw error;
    }
  }
  
  /**
   * Get lead with full details
   * @param {string} leadId - Lead ID
   * @returns {Promise<Object>} Lead with activities
   */
  async getLead(leadId) {
    try {
      if (this.#cache.has(leadId)) {
        return this.#cache.get(leadId);
      }
      
      const leadRef = doc(this.#db, 'crm_leads', leadId);
      const leadDoc = await getDoc(leadRef);
      
      if (!leadDoc.exists()) return null;
      
      const lead = { id: leadDoc.id, ...leadDoc.data() };
      
      // Load activities
      const activities = await this.listActivities({ leadId, limit: 20 });
      lead.recentActivities = activities.items;
      
      // Load notes
      const notes = await this.listActivities({ leadId, type: 'note', limit: 50 });
      lead.notes = notes.items;
      
      this.#cache.set(leadId, lead);
      
      return lead;
      
    } catch (error) {
      console.error('[CrmService] Get lead failed:', error);
      throw error;
    }
  }
  
  /**
   * List leads with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated leads
   */
  async listLeads(options = {}) {
    try {
      const {
        status = null,
        assignedTo = null,
        source = null,
        minScore = null,
        limit: pageSize = 20,
        startAfter = null
      } = options;
      
      let constraints = [orderBy('createdAt', 'desc')];
      
      if (status) constraints.unshift(where('status', '==', status));
      if (assignedTo) constraints.unshift(where('assignedTo', '==', assignedTo));
      if (source) constraints.unshift(where('source', '==', source));
      if (minScore) constraints.unshift(where('score.total', '>=', minScore));
      
      if (startAfter) {
        const cursorDoc = await getDoc(doc(this.#db, 'crm_leads', startAfter));
        if (cursorDoc.exists()) constraints.push(startAfter(cursorDoc));
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'crm_leads'), ...constraints);
      const snapshot = await getDocs(q);
      
      const leads = [];
      snapshot.forEach(doc => {
        leads.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        items: leads,
        pagination: {
          hasMore: leads.length === pageSize,
          nextCursor: leads.length ? leads[leads.length - 1].id : null
        }
      };
      
    } catch (error) {
      console.error('[CrmService] List leads failed:', error);
      throw error;
    }
  }
  
  /**
   * List activities with filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated activities
   */
  async listActivities(options = {}) {
    try {
      const {
        leadId = null,
        contactId = null,
        opportunityId = null,
        type = null,
        limit: pageSize = 20,
        startAfter = null
      } = options;
      
      let constraints = [orderBy('createdAt', 'desc')];
      
      if (leadId) constraints.unshift(where('leadId', '==', leadId));
      if (contactId) constraints.unshift(where('contactId', '==', contactId));
      if (opportunityId) constraints.unshift(where('opportunityId', '==', opportunityId));
      if (type) constraints.unshift(where('type', '==', type));
      
      if (startAfter) {
        const cursorDoc = await getDoc(doc(this.#db, 'crm_activities', startAfter));
        if (cursorDoc.exists()) constraints.push(startAfter(cursorDoc));
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'crm_activities'), ...constraints);
      const snapshot = await getDocs(q);
      
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        items: activities,
        pagination: {
          hasMore: activities.length === pageSize,
          nextCursor: activities.length ? activities[activities.length - 1].id : null
        }
      };
      
    } catch (error) {
      console.error('[CrmService] List activities failed:', error);
      throw error;
    }
  }
  
  /**
   * Update parent entity last activity
   * @private
   */
  async #updateParentLastActivity(activity) {
    const now = Timestamp.now();
    const batch = writeBatch(this.#db);
    
    if (activity.leadId) {
      const leadRef = doc(this.#db, 'crm_leads', activity.leadId);
      batch.update(leadRef, { lastActivityAt: now, updatedAt: now });
    }
    
    if (activity.contactId) {
      const contactRef = doc(this.#db, 'crm_contacts', activity.contactId);
      batch.update(contactRef, { lastActivityAt: now, updatedAt: now });
    }
    
    if (activity.opportunityId) {
      const oppRef = doc(this.#db, 'crm_opportunities', activity.opportunityId);
      batch.update(oppRef, { lastActivityAt: now, updatedAt: now });
    }
    
    await batch.commit();
  }
  
  /**
   * Validate email uniqueness
   * @private
   */
  async #validateEmailUniqueness(email, collection) {
    const q = query(collection(this.#db, collection), where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
  }
  
  /**
   * Generate lead number
   * @private
   */
  async #generateLeadNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const q = query(
      collection(this.#db, 'crm_leads'),
      where('createdAt', '>=', Timestamp.fromDate(new Date(year, month - 1, 1))),
      where('createdAt', '<', Timestamp.fromDate(new Date(year, month, 0)))
    );
    
    const snapshot = await getDocs(q);
    const sequence = String(snapshot.size + 1).padStart(4, '0');
    
    return `${this.#config.leadPrefix}-${year}${month}-${sequence}`;
  }
  
  /**
   * Generate opportunity number
   * @private
   */
  async #generateOpportunityNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const q = query(
      collection(this.#db, 'crm_opportunities'),
      where('createdAt', '>=', Timestamp.fromDate(new Date(year, month - 1, 1))),
      where('createdAt', '<', Timestamp.fromDate(new Date(year, month, 0)))
    );
    
    const snapshot = await getDocs(q);
    const sequence = String(snapshot.size + 1).padStart(4, '0');
    
    return `${this.#config.opportunityPrefix}-${year}${month}-${sequence}`;
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'LEAD_NOT_FOUND': 'Lead not found',
      'LEAD_ALREADY_CONVERTED': 'Lead has already been converted',
      'EMAIL_ALREADY_EXISTS': 'A lead with this email already exists'
    };
    
    const message = errorMap[error.message] || error.message || 'CRM_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const crmService = CrmService.getInstance();
export default crmService;