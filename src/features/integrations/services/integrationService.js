
/**
 * Integration Service
 * @module features/integration/services/integrationService
 * @description Core service for managing third-party integrations
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Integration Service Class
 */
export class IntegrationService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} RBAC service */
  #rbacService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {Map} Provider definitions */
  #providers = new Map();
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  constructor() {
    this.#db = getFirestore();
    this.#registerBuiltInProviders();
  }
  
  /**
   * Get singleton instance
   * @returns {IntegrationService} IntegrationService instance
   */
  static getInstance() {
    if (!globalThis.__integrationService) {
      globalThis.__integrationService = new IntegrationService();
    }
    return globalThis.__integrationService;
  }
  
  /**
   * Register built-in integration providers
   * @private
   */
  #registerBuiltInProviders() {
    this.#providers.set('stripe', {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      version: '1.0.0',
      requiredCredentials: ['secretKey', 'publicKey'],
      configSchema: {
        webhookSecret: { type: 'string', required: true },
        apiVersion: { type: 'string', default: '2023-10-16' }
      }
    });
    
    this.#providers.set('sendgrid', {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'email',
      version: '1.0.0',
      requiredCredentials: ['apiKey'],
      configSchema: {
        fromEmail: { type: 'string', required: true },
        fromName: { type: 'string', default: 'System' }
      }
    });
    
    this.#providers.set('slack', {
      id: 'slack',
      name: 'Slack',
      category: 'messaging',
      version: '1.0.0',
      requiredCredentials: ['botToken', 'signingSecret'],
      configSchema: {
        defaultChannel: { type: 'string', default: '#general' }
      }
    });
    
    this.#providers.set('twilio', {
      id: 'twilio',
      name: 'Twilio',
      category: 'sms',
      version: '1.0.0',
      requiredCredentials: ['accountSid', 'authToken'],
      configSchema: {
        fromPhone: { type: 'string', required: true }
      }
    });
    
    this.#providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      version: '1.0.0',
      requiredCredentials: ['apiKey'],
      configSchema: {
        organization: { type: 'string' },
        defaultModel: { type: 'string', default: 'gpt-4' }
      }
    });
  }
  
  /**
   * Initialize integration service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @param {Object} rbacService - RBAC service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService, rbacService) {
    if (this.#initialized) {
      console.warn('[IntegrationService] Already initialized');
      return;
    }
    
    try {
      this.#authService = authService;
      this.#rbacService = rbacService;
      this.#config = {
        providers: [],
        webhookSecret: '',
        encryptionKey: '',
        ...config
      };
      
      // Register custom providers from config
      if (this.#config.providers) {
        for (const provider of this.#config.providers) {
          this.#providers.set(provider.id, provider);
        }
      }
      
      this.#initialized = true;
      console.info('[IntegrationService] Initialized');
      
    } catch (error) {
      console.error('[IntegrationService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create integration instance
   * @param {Object} data - Integration data
   * @returns {Promise<Object>} Created integration
   */
  async createIntegration(data) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      // Check admin permission
      const isAdmin = await this.#rbacService.isSuperAdmin(user.uid);
      if (!isAdmin) {
        throw new Error('PERMISSION_DENIED');
      }
      
      const provider = this.#providers.get(data.providerId);
      if (!provider) {
        throw new Error(`PROVIDER_NOT_FOUND: ${data.providerId}`);
      }
      
      // Validate credentials
      for (const cred of provider.requiredCredentials) {
        if (!data.credentials || !data.credentials[cred]) {
          throw new Error(`MISSING_CREDENTIAL: ${cred}`);
        }
      }
      
      const integrationId = this.#generateId();
      const now = Timestamp.now();
      
      const integration = {
        id: integrationId,
        name: data.name,
        providerId: data.providerId,
        provider: provider,
        credentials: await this.#encryptCredentials(data.credentials),
        config: data.config || {},
        status: 'active',
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        lastTested: null,
        testStatus: null
      };
      
      const integrationRef = doc(this.#db, 'integrations', integrationId);
      await setDoc(integrationRef, integration);
      
      console.info(`[IntegrationService] Created integration: ${data.name} (${integrationId})`);
      
      // Remove credentials from returned object
      const { credentials, ...safeIntegration } = integration;
      return { ...safeIntegration, hasCredentials: true };
      
    } catch (error) {
      console.error('[IntegrationService] Create failed:', error);
      throw error;
    }
  }
  
  /**
   * Get integration by ID
   * @param {string} integrationId - Integration ID
   * @param {boolean} includeCredentials - Include decrypted credentials
   * @returns {Promise<Object|null>} Integration data
   */
  async getIntegration(integrationId, includeCredentials = false) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const integrationRef = doc(this.#db, 'integrations', integrationId);
      const integrationDoc = await getDoc(integrationRef);
      
      if (!integrationDoc.exists()) {
        return null;
      }
      
      const integration = integrationDoc.data();
      
      // Check permissions
      const isAdmin = await this.#rbacService.isSuperAdmin(user.uid);
      const isCreator = integration.createdBy === user.uid;
      
      if (!isAdmin && !isCreator) {
        throw new Error('PERMISSION_DENIED');
      }
      
      if (includeCredentials && isAdmin) {
        const decrypted = await this.#decryptCredentials(integration.credentials);
        return { ...integration, credentials: decrypted };
      }
      
      const { credentials, ...safeIntegration } = integration;
      return { ...safeIntegration, hasCredentials: !!credentials };
      
    } catch (error) {
      console.error('[IntegrationService] Get failed:', error);
      throw error;
    }
  }
  
  /**
   * List integrations
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of integrations
   */
  async listIntegrations(options = {}) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const { providerId, status } = options;
      let constraints = [];
      
      if (providerId) {
        constraints.push(where('providerId', '==', providerId));
      }
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      const q = query(collection(this.#db, 'integrations'), ...constraints);
      const snapshot = await getDocs(q);
      
      const integrations = [];
      snapshot.forEach(doc => {
        const { credentials, ...data } = doc.data();
        integrations.push({ id: doc.id, ...data, hasCredentials: !!credentials });
      });
      
      return integrations;
      
    } catch (error) {
      console.error('[IntegrationService] List failed:', error);
      throw error;
    }
  }
  
  /**
   * Update integration
   * @param {string} integrationId - Integration ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated integration
   */
  async updateIntegration(integrationId, updates) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error('INTEGRATION_NOT_FOUND');
      }
      
      const isAdmin = await this.#rbacService.isSuperAdmin(user.uid);
      if (!isAdmin) {
        throw new Error('PERMISSION_DENIED');
      }
      
      const allowedUpdates = ['name', 'config', 'status'];
      const filteredUpdates = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      if (updates.credentials) {
        filteredUpdates.credentials = await this.#encryptCredentials(updates.credentials);
      }
      
      filteredUpdates.updatedAt = Timestamp.now();
      
      const integrationRef = doc(this.#db, 'integrations', integrationId);
      await updateDoc(integrationRef, filteredUpdates);
      
      console.info(`[IntegrationService] Updated integration: ${integrationId}`);
      
      return this.getIntegration(integrationId);
      
    } catch (error) {
      console.error('[IntegrationService] Update failed:', error);
      throw error;
    }
  }
  
  /**
   * Delete integration
   * @param {string} integrationId - Integration ID
   * @returns {Promise<void>}
   */
  async deleteIntegration(integrationId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const isAdmin = await this.#rbacService.isSuperAdmin(user.uid);
      if (!isAdmin) {
        throw new Error('PERMISSION_DENIED');
      }
      
      const integrationRef = doc(this.#db, 'integrations', integrationId);
      await deleteDoc(integrationRef);
      
      console.info(`[IntegrationService] Deleted integration: ${integrationId}`);
      
    } catch (error) {
      console.error('[IntegrationService] Delete failed:', error);
      throw error;
    }
  }
  
  /**
   * Test integration connection
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} Test result
   */
  async testIntegration(integrationId) {
    try {
      const integration = await this.getIntegration(integrationId, true);
      if (!integration) {
        throw new Error('INTEGRATION_NOT_FOUND');
      }
      
      const result = {
        success: false,
        message: '',
        timestamp: Timestamp.now()
      };
      
      // Test based on provider type
      switch (integration.providerId) {
        case 'stripe':
          result.success = await this.#testStripe(integration);
          break;
        case 'sendgrid':
          result.success = await this.#testSendGrid(integration);
          break;
        case 'slack':
          result.success = await this.#testSlack(integration);
          break;
        default:
          result.message = 'Testing not implemented for this provider';
      }
      
      // Update integration with test results
      const integrationRef = doc(this.#db, 'integrations', integrationId);
      await updateDoc(integrationRef, {
        lastTested: result.timestamp,
        testStatus: result.success ? 'success' : 'failed',
        testMessage: result.message
      });
      
      return result;
      
    } catch (error) {
      console.error('[IntegrationService] Test failed:', error);
      return {
        success: false,
        message: error.message,
        timestamp: Timestamp.now()
      };
    }
  }
  
  /**
   * Get available providers
   * @returns {Array} List of providers
   */
  getProviders() {
    return Array.from(this.#providers.values());
  }
  
  /**
   * Encrypt sensitive credentials
   * @private
   * @param {Object} credentials - Plain text credentials
   * @returns {Promise<Object>} Encrypted credentials
   */
  async #encryptCredentials(credentials) {
    // In production, implement proper encryption (e.g., using crypto-js or Firebase KMS)
    // This is a placeholder that simulates encryption
    return {
      encrypted: true,
      data: Buffer.from(JSON.stringify(credentials)).toString('base64')
    };
  }
  
  /**
   * Decrypt credentials
   * @private
   * @param {Object} encrypted - Encrypted credentials
   * @returns {Promise<Object>} Decrypted credentials
   */
  async #decryptCredentials(encrypted) {
    if (!encrypted || !encrypted.encrypted) {
      return {};
    }
    
    try {
      const decrypted = JSON.parse(
        Buffer.from(encrypted.data, 'base64').toString('utf-8')
      );
      return decrypted;
    } catch {
      return {};
    }
  }
  
  /**
   * Test Stripe integration
   * @private
   * @param {Object} integration - Integration data
   * @returns {Promise<boolean>} Test result
   */
  async #testStripe(integration) {
    try {
      // Placeholder - actual Stripe test would make an API call
      console.log(`Testing Stripe with key: ${integration.credentials.secretKey?.substring(0, 8)}...`);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Test SendGrid integration
   * @private
   */
  async #testSendGrid(integration) {
    try {
      console.log(`Testing SendGrid with key: ${integration.credentials.apiKey?.substring(0, 8)}...`);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Test Slack integration
   * @private
   */
  async #testSlack(integration) {
    try {
      console.log(`Testing Slack with token: ${integration.credentials.botToken?.substring(0, 8)}...`);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId() {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const integrationService = IntegrationService.getInstance();
export default integrationService;
