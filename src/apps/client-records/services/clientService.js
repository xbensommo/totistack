/**
 * Client Service
 * @module apps/client-records/services/clientService
 * @description Core service for client management with normalized schema
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch, runTransaction } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Client Service Class with Normalized Schema Support
 */
export class ClientService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Client cache */
  #cache = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {ClientService} ClientService instance
   */
  static getInstance() {
    if (!globalThis.__clientService) {
      globalThis.__clientService = new ClientService();
    }
    return globalThis.__clientService;
  }
  
  /**
   * Initialize client service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService) {
    if (this.#initialized) {
      return;
    }
    
    try {
      this.#authService = authService;
      this.#config = {
        clientPrefix: 'CLT',
        defaultClientStatus: 'lead',
        enableSoftDelete: true,
        ...config
      };
      
      this.#initialized = true;
      console.info('[ClientService] Initialized');
      
    } catch (error) {
      console.error('[ClientService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create new client with normalized contacts and addresses
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client with relations
   */
  async createClient(clientData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const clientId = this.#generateId();
      const now = Timestamp.now();
      
      // Generate client number
      const clientNumber = await this.#generateClientNumber();
      
      // Prepare client master record
      const client = {
        id: clientId,
        clientNumber,
        type: clientData.type || 'individual',
        companyName: clientData.companyName || null,
        taxId: clientData.taxId || null,
        industry: clientData.industry || null,
        size: clientData.size || null,
        firstName: clientData.firstName || null,
        lastName: clientData.lastName || null,
        email: clientData.email || null,
        phone: clientData.phone || null,
        status: clientData.status || this.#config.defaultClientStatus,
        lifecycleStage: clientData.lifecycleStage || 'lead',
        leadSource: clientData.leadSource || null,
        leadScore: clientData.leadScore || 0,
        lifetimeValue: 0,
        firstContactAt: now,
        lastActivityAt: now,
        assignedTo: clientData.assignedTo || null,
        segmentIds: clientData.segmentIds || [],
        tags: clientData.tags || [],
        communicationPreferences: {
          email: true,
          sms: false,
          push: false,
          marketing: true,
          language: 'en',
          ...clientData.communicationPreferences
        },
        customFields: clientData.customFields || {},
        metadata: {
          createdBy: user.uid,
          updatedBy: user.uid,
          version: 1
        },
        createdAt: now,
        updatedAt: now
      };
      
      // Validate email uniqueness
      if (client.email) {
        await this.#validateEmailUniqueness(client.email, null);
      }
      
      // Use transaction for atomic creation
      const batch = writeBatch(this.#db);
      
      // Create client master
      const clientRef = doc(this.#db, 'clients', clientId);
      batch.set(clientRef, client);
      
      // Create primary contact if provided
      let primaryContactId = null;
      if (clientData.primaryContact) {
        const contactData = {
          ...clientData.primaryContact,
          clientId,
          isPrimary: true,
          role: 'primary'
        };
        const contact = await this.#createContactInBatch(batch, contactData);
        primaryContactId = contact.id;
      }
      
      // Create primary address if provided
      let defaultAddressId = null;
      if (clientData.address) {
        const addressData = {
          ...clientData.address,
          clientId,
          isDefault: true
        };
        const address = await this.#createAddressInBatch(batch, addressData);
        defaultAddressId = address.id;
      }
      
      // Update client with references
      if (primaryContactId || defaultAddressId) {
        const updates = {};
        if (primaryContactId) updates.primaryContactId = primaryContactId;
        if (defaultAddressId) updates.defaultAddressId = defaultAddressId;
        batch.update(clientRef, updates);
      }
      
      // Create initial activity log
      const activity = {
        clientId,
        userId: user.uid,
        type: 'note',
        action: 'client_created',
        description: `Client ${clientNumber} created`,
        isPublic: true,
        createdAt: now
      };
      const activityRef = doc(collection(this.#db, 'clientActivities'));
      batch.set(activityRef, activity);
      
      await batch.commit();
      
      // Invalidate cache
      this.#cache.clear();
      
      console.info(`[ClientService] Client created: ${clientNumber}`);
      
      // Trigger hooks
      await this.#onClientCreated(client);
      
      return this.getClient(clientId, true);
      
    } catch (error) {
      console.error('[ClientService] Create client failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Get client with all related data
   * @param {string} clientId - Client ID
   * @param {boolean} includeRelations - Include contacts, addresses, activities
   * @returns {Promise<Object>} Client with relations
   */
  async getClient(clientId, includeRelations = false) {
    try {
      const clientRef = doc(this.#db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        return null;
      }
      
      const client = { id: clientDoc.id, ...clientDoc.data() };
      
      if (includeRelations) {
        // Fetch contacts
        const contacts = await this.getClientContacts(clientId);
        client.contacts = contacts;
        
        // Fetch addresses
        const addresses = await this.getClientAddresses(clientId);
        client.addresses = addresses;
        
        // Fetch recent activities
        const activities = await this.getClientActivities(clientId, { limit: 20 });
        client.recentActivities = activities.items;
        
        // Fetch notes
        const notes = await this.getClientNotes(clientId);
        client.notes = notes;
        
        // Find primary contact
        client.primaryContact = contacts.find(c => c.isPrimary);
        
        // Find default address
        client.defaultAddress = addresses.find(a => a.isDefault);
      }
      
      return client;
      
    } catch (error) {
      console.error('[ClientService] Get client failed:', error);
      throw error;
    }
  }
  
  /**
   * Get client contacts
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Client contacts
   */
  async getClientContacts(clientId) {
    try {
      const q = query(
        collection(this.#db, 'clientContacts'),
        where('clientId', '==', clientId),
        orderBy('isPrimary', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const contacts = [];
      snapshot.forEach(doc => {
        contacts.push({ id: doc.id, ...doc.data() });
      });
      
      return contacts;
      
    } catch (error) {
      console.error('[ClientService] Get contacts failed:', error);
      return [];
    }
  }
  
  /**
   * Get client addresses
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Client addresses
   */
  async getClientAddresses(clientId) {
    try {
      const q = query(
        collection(this.#db, 'clientAddresses'),
        where('clientId', '==', clientId),
        orderBy('isDefault', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const addresses = [];
      snapshot.forEach(doc => {
        addresses.push({ id: doc.id, ...doc.data() });
      });
      
      return addresses;
      
    } catch (error) {
      console.error('[ClientService] Get addresses failed:', error);
      return [];
    }
  }
  
  /**
   * Get client activities
   * @param {string} clientId - Client ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated activities
   */
  async getClientActivities(clientId, options = {}) {
    try {
      const { limit: pageSize = 20, startAfter = null, type = null } = options;
      
      let constraints = [
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      ];
      
      if (type) {
        constraints.push(where('type', '==', type));
      }
      
      if (startAfter) {
        const cursorDoc = await getDoc(doc(this.#db, 'clientActivities', startAfter));
        if (cursorDoc.exists()) {
          constraints.push(startAfter(cursorDoc));
        }
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'clientActivities'), ...constraints);
      const snapshot = await getDocs(q);
      
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        items: activities,
        pagination: {
          limit: pageSize,
          hasMore: activities.length === pageSize,
          nextCursor: activities.length ? activities[activities.length - 1].id : null
        }
      };
      
    } catch (error) {
      console.error('[ClientService] Get activities failed:', error);
      return { items: [], pagination: { hasMore: false } };
    }
  }
  
  /**
   * Get client notes
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Client notes
   */
  async getClientNotes(clientId) {
    try {
      const q = query(
        collection(this.#db, 'clientNotes'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notes = [];
      snapshot.forEach(doc => {
        notes.push({ id: doc.id, ...doc.data() });
      });
      
      return notes;
      
    } catch (error) {
      console.error('[ClientService] Get notes failed:', error);
      return [];
    }
  }
  
  /**
   * Add contact to client
   * @param {string} clientId - Client ID
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact
   */
  async addContact(clientId, contactData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const client = await this.getClient(clientId);
      if (!client) {
        throw new Error('CLIENT_NOT_FOUND');
      }
      
      const contact = {
        ...contactData,
        clientId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // If this is the first contact, make it primary
      const existingContacts = await this.getClientContacts(clientId);
      if (existingContacts.length === 0) {
        contact.isPrimary = true;
        contact.role = 'primary';
      }
      
      const contactRef = doc(collection(this.#db, 'clientContacts'));
      await setDoc(contactRef, contact);
      
      // If this is primary, update client record
      if (contact.isPrimary) {
        const clientRef = doc(this.#db, 'clients', clientId);
        await updateDoc(clientRef, {
          primaryContactId: contactRef.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          updatedAt: Timestamp.now()
        });
      }
      
      // Log activity
      await this.logActivity(clientId, {
        type: 'note',
        action: 'contact_added',
        description: `Contact ${contact.firstName} ${contact.lastName} added`,
        metadata: { contactId: contactRef.id }
      });
      
      return { id: contactRef.id, ...contact };
      
    } catch (error) {
      console.error('[ClientService] Add contact failed:', error);
      throw error;
    }
  }
  
  /**
   * Add note to client
   * @param {string} clientId - Client ID
   * @param {Object} noteData - Note data
   * @returns {Promise<Object>} Created note
   */
  async addNote(clientId, noteData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const note = {
        clientId,
        userId: user.uid,
        content: noteData.content,
        type: noteData.type || 'general',
        isPublic: noteData.isPublic !== false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const noteRef = doc(collection(this.#db, 'clientNotes'));
      await setDoc(noteRef, note);
      
      // Update client last activity
      const clientRef = doc(this.#db, 'clients', clientId);
      await updateDoc(clientRef, {
        lastActivityAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Log activity
      await this.logActivity(clientId, {
        type: 'note',
        action: 'note_added',
        description: `Note added: ${noteData.content.substring(0, 100)}`,
        metadata: { noteId: noteRef.id }
      });
      
      return { id: noteRef.id, ...note };
      
    } catch (error) {
      console.error('[ClientService] Add note failed:', error);
      throw error;
    }
  }
  
  /**
   * Log client activity
   * @param {string} clientId - Client ID
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity
   */
  async logActivity(clientId, activityData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const activity = {
        clientId,
        userId: user.uid,
        type: activityData.type,
        action: activityData.action,
        description: activityData.description,
        referenceType: activityData.referenceType || null,
        referenceId: activityData.referenceId || null,
        metadata: activityData.metadata || {},
        duration: activityData.duration || null,
        outcome: activityData.outcome || 'completed',
        priority: activityData.priority || 'medium',
        isPublic: activityData.isPublic !== false,
        createdAt: Timestamp.now()
      };
      
      const activityRef = doc(collection(this.#db, 'clientActivities'));
      await setDoc(activityRef, activity);
      
      // Update client last activity
      const clientRef = doc(this.#db, 'clients', clientId);
      await updateDoc(clientRef, {
        lastActivityAt: Timestamp.now()
      });
      
      return { id: activityRef.id, ...activity };
      
    } catch (error) {
      console.error('[ClientService] Log activity failed:', error);
      throw error;
    }
  }
  
  /**
   * Update client
   * @param {string} clientId - Client ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated client
   */
  async updateClient(clientId, updates) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const client = await this.getClient(clientId);
      if (!client) {
        throw new Error('CLIENT_NOT_FOUND');
      }
      
      // Check email uniqueness if being updated
      if (updates.email && updates.email !== client.email) {
        await this.#validateEmailUniqueness(updates.email, clientId);
      }
      
      const allowedUpdates = [
        'companyName', 'taxId', 'industry', 'size', 'firstName', 'lastName',
        'email', 'phone', 'status', 'lifecycleStage', 'leadSource', 'leadScore',
        'assignedTo', 'segmentIds', 'tags', 'communicationPreferences', 'customFields'
      ];
      
      const filteredUpdates = {};
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      filteredUpdates.updatedAt = Timestamp.now();
      filteredUpdates['metadata.version'] = (client.metadata?.version || 0) + 1;
      filteredUpdates['metadata.updatedBy'] = user.uid;
      
      const clientRef = doc(this.#db, 'clients', clientId);
      await updateDoc(clientRef, filteredUpdates);
      
      // Log activity
      await this.logActivity(clientId, {
        type: 'edit',
        action: 'client_updated',
        description: `Client information updated`,
        metadata: { updates: Object.keys(filteredUpdates) }
      });
      
      // Invalidate cache
      this.#cache.delete(clientId);
      
      console.info(`[ClientService] Client updated: ${client.clientNumber}`);
      
      return this.getClient(clientId, true);
      
    } catch (error) {
      console.error('[ClientService] Update client failed:', error);
      throw error;
    }
  }
  
  /**
   * Delete client (soft delete)
   * @param {string} clientId - Client ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteClient(clientId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const client = await this.getClient(clientId);
      if (!client) {
        throw new Error('CLIENT_NOT_FOUND');
      }
      
      if (this.#config.enableSoftDelete) {
        // Soft delete - mark as deleted
        const clientRef = doc(this.#db, 'clients', clientId);
        await updateDoc(clientRef, {
          status: 'inactive',
          deletedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          'metadata.deletedBy': user.uid
        });
      } else {
        // Hard delete - remove all related records
        const batch = writeBatch(this.#db);
        
        // Delete client
        const clientRef = doc(this.#db, 'clients', clientId);
        batch.delete(clientRef);
        
        // Delete contacts
        const contacts = await this.getClientContacts(clientId);
        contacts.forEach(contact => {
          const contactRef = doc(this.#db, 'clientContacts', contact.id);
          batch.delete(contactRef);
        });
        
        // Delete addresses
        const addresses = await this.getClientAddresses(clientId);
        addresses.forEach(address => {
          const addressRef = doc(this.#db, 'clientAddresses', address.id);
          batch.delete(addressRef);
        });
        
        // Delete notes
        const notes = await this.getClientNotes(clientId);
        notes.forEach(note => {
          const noteRef = doc(this.#db, 'clientNotes', note.id);
          batch.delete(noteRef);
        });
        
        await batch.commit();
      }
      
      // Invalidate cache
      this.#cache.delete(clientId);
      
      console.info(`[ClientService] Client deleted: ${client.clientNumber}`);
      
      return true;
      
    } catch (error) {
      console.error('[ClientService] Delete client failed:', error);
      throw error;
    }
  }
  
  /**
   * Search clients
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Search results
   */
  async searchClients(query, filters = {}) {
    try {
      // For production, implement proper search (Algolia, Elasticsearch, or Firebase Extensions)
      // This is a simplified implementation
      let constraints = [];
      
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }
      
      if (filters.assignedTo) {
        constraints.push(where('assignedTo', '==', filters.assignedTo));
      }
      
      constraints.push(limit(filters.limit || 50));
      
      const q = query(collection(this.#db, 'clients'), ...constraints);
      const snapshot = await getDocs(q);
      
      const results = [];
      snapshot.forEach(doc => {
        const client = doc.data();
        
        // Simple text search (in production, use proper search)
        const searchable = `${client.clientNumber} ${client.firstName} ${client.lastName} ${client.email} ${client.companyName || ''}`.toLowerCase();
        if (query && !searchable.includes(query.toLowerCase())) {
          return;
        }
        
        results.push({ id: doc.id, ...client });
      });
      
      return results;
      
    } catch (error) {
      console.error('[ClientService] Search failed:', error);
      return [];
    }
  }
  
  /**
   * Validate email uniqueness
   * @private
   */
  async #validateEmailUniqueness(email, excludeClientId = null) {
    if (!email) return;
    
    const q = query(
      collection(this.#db, 'clients'),
      where('email', '==', email)
    );
    
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      if (doc.id !== excludeClientId) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }
  }
  
  /**
   * Create contact in batch
   * @private
   */
  async #createContactInBatch(batch, contactData) {
    const contactRef = doc(collection(this.#db, 'clientContacts'));
    const contact = {
      ...contactData,
      id: contactRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    batch.set(contactRef, contact);
    return contact;
  }
  
  /**
   * Create address in batch
   * @private
   */
  async #createAddressInBatch(batch, addressData) {
    const addressRef = doc(collection(this.#db, 'clientAddresses'));
    const address = {
      ...addressData,
      id: addressRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    batch.set(addressRef, address);
    return address;
  }
  
  /**
   * Generate client number
   * @private
   */
  async #generateClientNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const q = query(
      collection(this.#db, 'clients'),
      where('createdAt', '>=', Timestamp.fromDate(new Date(year, month - 1, 1))),
      where('createdAt', '<', Timestamp.fromDate(new Date(year, month, 0)))
    );
    
    const snapshot = await getDocs(q);
    const sequence = String(snapshot.size + 1).padStart(4, '0');
    
    return `${this.#config.clientPrefix}-${year}${month}-${sequence}`;
  }
  
  /**
   * Handle client creation hooks
   * @private
   */
  async #onClientCreated(client) {
    // Send welcome email
    // Assign to default segment
    // Trigger analytics
    console.info(`[ClientService] Client created hook: ${client.clientNumber}`);
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId() {
    return `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'CLIENT_NOT_FOUND': 'Client not found',
      'EMAIL_ALREADY_EXISTS': 'A client with this email already exists',
      'INVALID_CLIENT_TYPE': 'Invalid client type',
      'MISSING_REQUIRED_FIELDS': 'Missing required fields'
    };
    
    const message = errorMap[error.message] || error.message || 'CLIENT_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const clientService = ClientService.getInstance();
export default clientService;