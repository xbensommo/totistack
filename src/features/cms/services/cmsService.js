/**
 * CMS Service
 * @module features/cms/services/cmsService
 * @description Core CMS service for content management
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch, runTransaction } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * CMS Service Class
 */
export class CmsService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Media service */
  #mediaService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Page cache */
  #pageCache = new Map();
  
  /** @type {Map} Content type cache */
  #contentTypeCache = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {CmsService} CmsService instance
   */
  static getInstance() {
    if (!globalThis.__cmsService) {
      globalThis.__cmsService = new CmsService();
    }
    return globalThis.__cmsService;
  }
  
  /**
   * Initialize CMS service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @param {Object} mediaService - Media service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService, mediaService) {
    if (this.#initialized) return;
    
    try {
      this.#authService = authService;
      this.#mediaService = mediaService;
      this.#config = {
        enableVersioning: true,
        enablePreview: true,
        maxVersions: 10,
        defaultLocale: 'en',
        supportedLocales: ['en'],
        ...config
      };
      
      // Load content types into cache
      await this.#loadContentTypes();
      
      this.#initialized = true;
      console.info('[CmsService] Initialized');
      
    } catch (error) {
      console.error('[CmsService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create content type
   * @param {Object} contentTypeData - Content type definition
   * @returns {Promise<Object>} Created content type
   */
  async createContentType(contentTypeData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const contentTypeId = this.#generateId('ct');
      const now = Timestamp.now();
      
      const contentType = {
        id: contentTypeId,
        name: contentTypeData.name,
        slug: this.#slugify(contentTypeData.name),
        description: contentTypeData.description,
        fields: contentTypeData.fields,
        displayField: contentTypeData.displayField,
        listFields: contentTypeData.listFields || ['title'],
        searchableFields: contentTypeData.searchableFields || ['title', 'description'],
        seoFields: contentTypeData.seoFields || {},
        permissions: contentTypeData.permissions || {
          canCreate: ['admin', 'editor'],
          canRead: ['admin', 'editor', 'user'],
          canUpdate: ['admin', 'editor'],
          canDelete: ['admin']
        },
        status: 'published',
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid
      };
      
      // Validate schema
      this.#validateContentType(contentType);
      
      const contentTypeRef = doc(this.#db, 'contentTypes', contentTypeId);
      await setDoc(contentTypeRef, contentType);
      
      this.#contentTypeCache.set(contentTypeId, contentType);
      
      console.info(`[CmsService] Content type created: ${contentType.name}`);
      
      return contentType;
      
    } catch (error) {
      console.error('[CmsService] Create content type failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Create content entry
   * @param {string} contentTypeId - Content type ID
   * @param {Object} entryData - Entry data
   * @returns {Promise<Object>} Created entry
   */
  async createEntry(contentTypeId, entryData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const contentType = await this.getContentType(contentTypeId);
      if (!contentType) throw new Error('CONTENT_TYPE_NOT_FOUND');
      
      // Validate fields against schema
      const validatedData = this.#validateEntryData(contentType, entryData);
      
      const entryId = this.#generateId('entry');
      const now = Timestamp.now();
      
      // Generate slug if not provided and has URL field
      let slug = validatedData.slug;
      if (!slug && contentType.seoFields?.urlSlug && validatedData[contentType.seoFields.urlSlug]) {
        slug = this.#slugify(validatedData[contentType.seoFields.urlSlug]);
      } else if (!slug) {
        slug = `${contentType.slug}-${entryId}`;
      }
      
      // Ensure slug uniqueness
      slug = await this.#ensureUniqueSlug(slug, contentType.slug);
      
      const entry = {
        id: entryId,
        contentTypeId,
        contentTypeSlug: contentType.slug,
        slug,
        data: validatedData,
        status: 'draft',
        version: 1,
        createdBy: user.uid,
        updatedBy: user.uid,
        createdAt: now,
        updatedAt: now
      };
      
      const entryRef = doc(this.#db, 'contentEntries', entryId);
      await setDoc(entryRef, entry);
      
      console.info(`[CmsService] Entry created: ${contentType.name} - ${entryId}`);
      
      return entry;
      
    } catch (error) {
      console.error('[CmsService] Create entry failed:', error);
      throw error;
    }
  }
  
  /**
   * Create page
   * @param {Object} pageData - Page data
   * @returns {Promise<Object>} Created page
   */
  async createPage(pageData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const pageId = this.#generateId('page');
      const now = Timestamp.now();
      
      // Generate slug and path
      let slug = pageData.slug || this.#slugify(pageData.title);
      slug = await this.#ensureUniqueSlug(slug, 'pages');
      
      const path = await this.#generatePath(pageData.parentId, slug);
      
      const page = {
        id: pageId,
        title: pageData.title,
        slug,
        path,
        template: pageData.template || 'default',
        blocks: pageData.blocks || [],
        parentId: pageData.parentId || null,
        children: [],
        showInNav: pageData.showInNav || false,
        navOrder: pageData.navOrder || 0,
        navLabel: pageData.navLabel || pageData.title,
        seo: {
          metaTitle: pageData.seo?.metaTitle || pageData.title,
          metaDescription: pageData.seo?.metaDescription || '',
          metaKeywords: pageData.seo?.metaKeywords || '',
          noIndex: pageData.seo?.noIndex || false,
          ...pageData.seo
        },
        status: pageData.status || 'draft',
        version: 1,
        createdBy: user.uid,
        updatedBy: user.uid,
        createdAt: now,
        updatedAt: now
      };
      
      // Validate page
      this.#validatePage(page);
      
      const pageRef = doc(this.#db, 'pages', pageId);
      await setDoc(pageRef, page);
      
      // Update parent's children array
      if (page.parentId) {
        const parentRef = doc(this.#db, 'pages', page.parentId);
        await updateDoc(parentRef, {
          children: arrayUnion(pageId)
        });
      }
      
      // Invalidate cache
      this.#pageCache.clear();
      
      console.info(`[CmsService] Page created: ${page.title} at ${page.path}`);
      
      return page;
      
    } catch (error) {
      console.error('[CmsService] Create page failed:', error);
      throw error;
    }
  }
  
  /**
   * Get page by slug or ID
   * @param {string} identifier - Page ID or slug
   * @returns {Promise<Object|null>} Page data
   */
  async getPage(identifier) {
    try {
      // Check cache
      if (this.#pageCache.has(identifier)) {
        return this.#pageCache.get(identifier);
      }
      
      let pageRef;
      let pageDoc;
      
      if (identifier.startsWith('page_')) {
        pageRef = doc(this.#db, 'pages', identifier);
        pageDoc = await getDoc(pageRef);
      } else {
        const q = query(collection(this.#db, 'pages'), where('path', '==', identifier), limit(1));
        const snapshot = await getDocs(q);
        pageDoc = snapshot.docs[0];
      }
      
      if (!pageDoc?.exists()) {
        return null;
      }
      
      const page = { id: pageDoc.id, ...pageDoc.data() };
      
      // Load blocks content
      if (page.blocks && page.blocks.length > 0) {
        page.blocks = await this.#hydrateBlocks(page.blocks);
      }
      
      this.#pageCache.set(identifier, page);
      
      return page;
      
    } catch (error) {
      console.error('[CmsService] Get page failed:', error);
      throw error;
    }
  }
  
  /**
   * Publish content
   * @param {string} collection - Collection name (pages or contentEntries)
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Published content
   */
  async publish(collection, id) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const ref = doc(this.#db, collection, id);
      const docSnap = await getDoc(ref);
      
      if (!docSnap.exists()) throw new Error('CONTENT_NOT_FOUND');
      
      const content = docSnap.data();
      const now = Timestamp.now();
      
      // Create version if versioning enabled
      if (this.#config.enableVersioning && collection === 'pages') {
        await this.#createVersion(collection, id, content);
      }
      
      const updates = {
        status: 'published',
        publishedAt: now,
        updatedAt: now,
        updatedBy: user.uid,
        version: (content.version || 0) + 1
      };
      
      await updateDoc(ref, updates);
      
      // Invalidate cache
      this.#pageCache.clear();
      
      console.info(`[CmsService] Published ${collection}/${id}`);
      
      return { ...content, ...updates };
      
    } catch (error) {
      console.error('[CmsService] Publish failed:', error);
      throw error;
    }
  }
  
  /**
   * Register dynamic routes for content
   * @param {Object} router - Vue Router instance
   * @returns {Promise<void>}
   */
  async registerDynamicRoutes(router) {
    try {
      // Get all published pages
      const q = query(
        collection(this.#db, 'pages'),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Timestamp.now())
      );
      
      const snapshot = await getDocs(q);
      
      // Register routes
      snapshot.forEach(doc => {
        const page = doc.data();
        const route = {
          path: page.path,
          name: `page-${page.id}`,
          component: () => import('./components/PageRenderer.vue'),
          meta: {
            pageId: doc.id,
            pageTitle: page.title,
            seo: page.seo
          }
        };
        
        router.addRoute(route);
      });
      
      console.info(`[CmsService] Registered ${snapshot.size} dynamic routes`);
      
    } catch (error) {
      console.error('[CmsService] Register routes failed:', error);
    }
  }
  
  /**
   * Get content type
   * @param {string} contentTypeId - Content type ID
   * @returns {Promise<Object|null>} Content type
   */
  async getContentType(contentTypeId) {
    if (this.#contentTypeCache.has(contentTypeId)) {
      return this.#contentTypeCache.get(contentTypeId);
    }
    
    const contentTypeRef = doc(this.#db, 'contentTypes', contentTypeId);
    const contentTypeDoc = await getDoc(contentTypeRef);
    
    if (!contentTypeDoc.exists()) return null;
    
    const contentType = contentTypeDoc.data();
    this.#contentTypeCache.set(contentTypeId, contentType);
    
    return contentType;
  }
  
  /**
   * List content entries
   * @param {string} contentTypeId - Content type ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated entries
   */
  async listEntries(contentTypeId, options = {}) {
    try {
      const { status = null, limit = 20, startAfter = null } = options;
      
      let constraints = [where('contentTypeId', '==', contentTypeId)];
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (startAfter) {
        const cursorDoc = await getDoc(doc(this.#db, 'contentEntries', startAfter));
        if (cursorDoc.exists()) {
          constraints.push(startAfter(cursorDoc));
        }
      }
      
      constraints.push(limit(limit));
      
      const q = query(collection(this.#db, 'contentEntries'), ...constraints);
      const snapshot = await getDocs(q);
      
      const entries = [];
      snapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        items: entries,
        pagination: {
          hasMore: entries.length === limit,
          nextCursor: entries.length ? entries[entries.length - 1].id : null
        }
      };
      
    } catch (error) {
      console.error('[CmsService] List entries failed:', error);
      throw error;
    }
  }
  
  /**
   * Load content types into cache
   * @private
   */
  async #loadContentTypes() {
    try {
      const snapshot = await getDocs(collection(this.#db, 'contentTypes'));
      snapshot.forEach(doc => {
        this.#contentTypeCache.set(doc.id, doc.data());
      });
    } catch (error) {
      console.warn('[CmsService] Failed to load content types:', error);
    }
  }
  
  /**
   * Validate content type schema
   * @private
   */
  #validateContentType(contentType) {
    if (!contentType.name) throw new Error('CONTENT_TYPE_NAME_REQUIRED');
    if (!contentType.fields || contentType.fields.length === 0) {
      throw new Error('CONTENT_TYPE_FIELDS_REQUIRED');
    }
    
    for (const field of contentType.fields) {
      if (!field.id || !field.name || !field.type) {
        throw new Error('INVALID_FIELD_DEFINITION');
      }
    }
  }
  
  /**
   * Validate entry data against schema
   * @private
   */
  #validateEntryData(contentType, entryData) {
    const validated = {};
    
    for (const field of contentType.fields) {
      const value = entryData[field.id];
      
      // Check required
      if (field.required && (value === undefined || value === null || value === '')) {
        throw new Error(`FIELD_REQUIRED: ${field.name}`);
      }
      
      // Validate based on type
      if (value !== undefined && value !== null) {
        switch (field.type) {
          case 'number':
            if (isNaN(Number(value))) {
              throw new Error(`INVALID_NUMBER: ${field.name}`);
            }
            validated[field.id] = Number(value);
            break;
          case 'boolean':
            validated[field.id] = Boolean(value);
            break;
          case 'date':
            validated[field.id] = value instanceof Date ? value : new Date(value);
            break;
          default:
            validated[field.id] = value;
        }
      } else if (field.defaultValue !== undefined) {
        validated[field.id] = field.defaultValue;
      }
    }
    
    return validated;
  }
  
  /**
   * Validate page data
   * @private
   */
  #validatePage(page) {
    if (!page.title) throw new Error('PAGE_TITLE_REQUIRED');
    if (!page.slug) throw new Error('PAGE_SLUG_REQUIRED');
  }
  
  /**
   * Hydrate blocks with content
   * @private
   */
  async #hydrateBlocks(blocks) {
    const hydrated = [];
    
    for (const block of blocks) {
      if (block.type === 'content' && block.content?.entryId) {
        const entry = await this.getEntry(block.content.entryId);
        hydrated.push({
          ...block,
          content: { ...block.content, entry }
        });
      } else {
        hydrated.push(block);
      }
    }
    
    return hydrated;
  }
  
  /**
   * Create version of content
   * @private
   */
  async #createVersion(collection, id, content) {
    try {
      const versionId = this.#generateId('version');
      const version = {
        id: versionId,
        collection,
        documentId: id,
        version: content.version + 1,
        data: content,
        createdBy: this.#authService.getCurrentUser()?.uid,
        createdAt: Timestamp.now()
      };
      
      const versionRef = doc(this.#db, 'contentVersions', versionId);
      await setDoc(versionRef, version);
      
      // Clean up old versions
      const q = query(
        collection(this.#db, 'contentVersions'),
        where('documentId', '==', id),
        orderBy('version', 'desc')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.size > this.#config.maxVersions) {
        const batch = writeBatch(this.#db);
        const toDelete = Array.from(snapshot.docs).slice(this.#config.maxVersions);
        toDelete.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      
    } catch (error) {
      console.warn('[CmsService] Version creation failed:', error);
    }
  }
  
  /**
   * Generate unique slug
   * @private
   */
  async #ensureUniqueSlug(baseSlug, collection) {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const q = query(collection(this.#db, collection), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) break;
      
      slug = `${baseSlug}-${counter++}`;
    }
    
    return slug;
  }
  
  /**
   * Generate page path from parent
   * @private
   */
  async #generatePath(parentId, slug) {
    if (!parentId) return `/${slug}`;
    
    const parent = await this.getPage(parentId);
    if (!parent) return `/${slug}`;
    
    return `${parent.path}/${slug}`;
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId(prefix = 'cms') {
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
      'CONTENT_TYPE_NOT_FOUND': 'Content type not found',
      'CONTENT_TYPE_NAME_REQUIRED': 'Content type name is required',
      'CONTENT_TYPE_FIELDS_REQUIRED': 'At least one field is required',
      'INVALID_FIELD_DEFINITION': 'Invalid field definition',
      'FIELD_REQUIRED': 'Required field missing',
      'INVALID_NUMBER': 'Invalid number format',
      'PAGE_TITLE_REQUIRED': 'Page title is required',
      'PAGE_SLUG_REQUIRED': 'Page slug is required',
      'CONTENT_NOT_FOUND': 'Content not found'
    };
    
    const message = errorMap[error.message] || error.message || 'CMS_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const cmsService = CmsService.getInstance();
export default cmsService;