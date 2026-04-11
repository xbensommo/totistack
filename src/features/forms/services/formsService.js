
/**
 * Forms Service
 * @module features/forms/services/formsService
 * @description Core forms management service
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Forms Service Class
 */
export class FormsService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Form cache */
  #formCache = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {FormsService} FormsService instance
   */
  static getInstance() {
    if (!globalThis.__formsService) {
      globalThis.__formsService = new FormsService();
    }
    return globalThis.__formsService;
  }
  
  /**
   * Initialize forms service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService) {
    if (this.#initialized) return;
    
    try {
      this.#authService = authService;
      this.#config = {
        maxSubmissionsPerForm: 10000,
        enableSpamProtection: true,
        spamScoreThreshold: 5,
        fileUploadMaxSize: 10485760,
        allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
        ...config
      };
      
      this.#initialized = true;
      console.info('[FormsService] Initialized');
      
    } catch (error) {
      console.error('[FormsService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create form
   * @param {Object} formData - Form definition
   * @returns {Promise<Object>} Created form
   */
  async createForm(formData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const formId = this.#generateId('form');
      const now = Timestamp.now();
      
      const form = {
        id: formId,
        name: formData.name,
        slug: this.#slugify(formData.name),
        description: formData.description,
        settings: {
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          requireLogin: false,
          limitSubmissions: false,
          maxSubmissions: 1000,
          enableCaptcha: false,
          saveSubmissions: true,
          ...formData.settings
        },
        notifications: formData.notifications || [],
        webhooks: formData.webhooks || [],
        design: {
          theme: 'default',
          layout: 'vertical',
          ...formData.design
        },
        status: 'draft',
        totalSubmissions: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid
      };
      
      const formRef = doc(this.#db, 'forms', formId);
      await setDoc(formRef, form);
      
      // Create fields
      if (formData.fields && formData.fields.length > 0) {
        await this.#createFields(formId, formData.fields);
      }
      
      this.#formCache.set(formId, form);
      
      console.info(`[FormsService] Form created: ${form.name}`);
      
      return form;
      
    } catch (error) {
      console.error('[FormsService] Create form failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Get form by ID or slug
   * @param {string} identifier - Form ID or slug
   * @returns {Promise<Object|null>} Form with fields
   */
  async getForm(identifier) {
    try {
      // Check cache
      if (this.#formCache.has(identifier)) {
        return this.#formCache.get(identifier);
      }
      
      let formDoc;
      
      if (identifier.startsWith('form_')) {
        const formRef = doc(this.#db, 'forms', identifier);
        formDoc = await getDoc(formRef);
      } else {
        const q = query(collection(this.#db, 'forms'), where('slug', '==', identifier), limit(1));
        const snapshot = await getDocs(q);
        formDoc = snapshot.docs[0];
      }
      
      if (!formDoc?.exists()) return null;
      
      const form = { id: formDoc.id, ...formDoc.data() };
      
      // Load fields
      form.fields = await this.#getFields(form.id);
      
      this.#formCache.set(identifier, form);
      
      return form;
      
    } catch (error) {
      console.error('[FormsService] Get form failed:', error);
      throw error;
    }
  }
  
  /**
   * List forms
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Forms list
   */
  async listForms(options = {}) {
    try {
      const { status = null, limit = 50 } = options;
      
      let constraints = [orderBy('createdAt', 'desc')];
      
      if (status) {
        constraints.unshift(where('status', '==', status));
      }
      
      constraints.push(limit(limit));
      
      const q = query(collection(this.#db, 'forms'), ...constraints);
      const snapshot = await getDocs(q);
      
      const forms = [];
      snapshot.forEach(doc => {
        forms.push({ id: doc.id, ...doc.data() });
      });
      
      return forms;
      
    } catch (error) {
      console.error('[FormsService] List forms failed:', error);
      throw error;
    }
  }
  
  /**
   * Update form
   * @param {string} formId - Form ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated form
   */
  async updateForm(formId, updates) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const form = await this.getForm(formId);
      if (!form) throw new Error('FORM_NOT_FOUND');
      
      const allowedUpdates = ['name', 'description', 'settings', 'notifications', 'webhooks', 'design', 'status'];
      const filteredUpdates = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      // Update slug if name changed
      if (updates.name && updates.name !== form.name) {
        filteredUpdates.slug = this.#slugify(updates.name);
        filteredUpdates.slug = await this.#ensureUniqueSlug(filteredUpdates.slug);
      }
      
      filteredUpdates.updatedAt = Timestamp.now();
      
      const formRef = doc(this.#db, 'forms', formId);
      await updateDoc(formRef, filteredUpdates);
      
      // Update fields if provided
      if (updates.fields) {
        await this.#updateFields(formId, updates.fields);
      }
      
      this.#formCache.delete(formId);
      this.#formCache.delete(form.slug);
      
      console.info(`[FormsService] Form updated: ${form.name}`);
      
      return this.getForm(formId);
      
    } catch (error) {
      console.error('[FormsService] Update form failed:', error);
      throw error;
    }
  }
  
  /**
   * Delete form
   * @param {string} formId - Form ID
   * @returns {Promise<void>}
   */
  async deleteForm(formId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const batch = writeBatch(this.#db);
      
      // Delete form
      const formRef = doc(this.#db, 'forms', formId);
      batch.delete(formRef);
      
      // Delete fields
      const fields = await this.#getFields(formId);
      fields.forEach(field => {
        const fieldRef = doc(this.#db, 'formFields', field.id);
        batch.delete(fieldRef);
      });
      
      // Delete submissions
      const submissionsQuery = query(collection(this.#db, 'formSubmissions'), where('formId', '==', formId));
      const submissions = await getDocs(submissionsQuery);
      submissions.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      this.#formCache.clear();
      
      console.info(`[FormsService] Form deleted: ${formId}`);
      
    } catch (error) {
      console.error('[FormsService] Delete form failed:', error);
      throw error;
    }
  }
  
  /**
   * Get form fields
   * @private
   * @param {string} formId - Form ID
   * @returns {Promise<Array>} Form fields
   */
  async #getFields(formId) {
    try {
      const q = query(
        collection(this.#db, 'formFields'),
        where('formId', '==', formId),
        orderBy('order')
      );
      
      const snapshot = await getDocs(q);
      const fields = [];
      snapshot.forEach(doc => {
        fields.push({ id: doc.id, ...doc.data() });
      });
      
      return fields;
      
    } catch (error) {
      console.error('[FormsService] Get fields failed:', error);
      return [];
    }
  }
  
  /**
   * Create form fields
   * @private
   */
  async #createFields(formId, fields) {
    const batch = writeBatch(this.#db);
    const now = Timestamp.now();
    
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldId = this.#generateId('field');
      
      const fieldData = {
        id: fieldId,
        formId,
        fieldId: field.fieldId || fieldId,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        description: field.description,
        defaultValue: field.defaultValue,
        options: field.options || [],
        validation: {
          required: false,
          ...field.validation
        },
        conditions: field.conditions || [],
        width: field.width || 12,
        order: i,
        settings: field.settings || {},
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      
      const fieldRef = doc(this.#db, 'formFields', fieldId);
      batch.set(fieldRef, fieldData);
    }
    
    await batch.commit();
  }
  
  /**
   * Update form fields
   * @private
   */
  async #updateFields(formId, newFields) {
    const existingFields = await this.#getFields(formId);
    const batch = writeBatch(this.#db);
    const now = Timestamp.now();
    
    // Create maps for comparison
    const existingMap = new Map(existingFields.map(f => [f.fieldId, f]));
    const newMap = new Map(newFields.map(f => [f.fieldId || f.id, f]));
    
    // Delete removed fields
    for (const [fieldId, field] of existingMap) {
      if (!newMap.has(fieldId)) {
        const fieldRef = doc(this.#db, 'formFields', field.id);
        batch.delete(fieldRef);
      }
    }
    
    // Create or update fields
    for (let i = 0; i < newFields.length; i++) {
      const newField = newFields[i];
      const fieldId = newField.fieldId || newField.id;
      const existing = existingMap.get(fieldId);
      
      const fieldData = {
        formId,
        fieldId,
        label: newField.label,
        type: newField.type,
        placeholder: newField.placeholder,
        description: newField.description,
        defaultValue: newField.defaultValue,
        options: newField.options || [],
        validation: {
          required: false,
          ...newField.validation
        },
        conditions: newField.conditions || [],
        width: newField.width || 12,
        order: i,
        settings: newField.settings || {},
        isActive: true,
        updatedAt: now
      };
      
      if (existing) {
        const fieldRef = doc(this.#db, 'formFields', existing.id);
        batch.update(fieldRef, fieldData);
      } else {
        fieldData.id = this.#generateId('field');
        fieldData.createdAt = now;
        const fieldRef = doc(this.#db, 'formFields', fieldData.id);
        batch.set(fieldRef, fieldData);
      }
    }
    
    await batch.commit();
  }
  
  /**
   * Ensure unique slug
   * @private
   */
  async #ensureUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const q = query(collection(this.#db, 'forms'), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) break;
      
      slug = `${baseSlug}-${counter++}`;
    }
    
    return slug;
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId(prefix = 'form') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Slugify string
   * @private
   */
  #slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'FORM_NOT_FOUND': 'Form not found'
    };
    
    const message = errorMap[error.message] || error.message || 'FORMS_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const formsService = FormsService.getInstance();
export default formsService;