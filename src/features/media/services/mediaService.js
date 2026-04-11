/**
 * Media Service
 * @module features/media/services/mediaService
 * @description Core media management service handling CRUD operations for media assets
 * @author Totistack Team
 * @date 2026-03-22
 */

import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, startAfter, Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Media Service Class
 */
export class MediaService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Storage instance */
  #storage = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Cache for media metadata */
  #cache = new Map();
  
  constructor() {
    this.#db = getFirestore();
    this.#storage = getStorage();
  }
  
  /**
   * Get singleton instance
   * @returns {MediaService} MediaService instance
   */
  static getInstance() {
    if (!globalThis.__mediaService) {
      globalThis.__mediaService = new MediaService();
    }
    return globalThis.__mediaService;
  }
  
  /**
   * Initialize media service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service instance
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService) {
    if (this.#initialized) {
      console.warn('[MediaService] Already initialized');
      return;
    }
    
    try {
      this.#authService = authService;
      this.#config = {
        maxFileSize: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
        imageOptimization: {
          enabled: true,
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 80
        },
        storageBucket: '',
        enableCdn: true,
        ...config
      };
      
      this.#initialized = true;
      console.info('[MediaService] Initialized');
      
    } catch (error) {
      console.error('[MediaService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Upload media file
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @param {string} options.folder - Target folder path
   * @param {Object} options.metadata - Custom metadata
   * @param {Function} options.onProgress - Progress callback
   * @returns {Promise<Object>} Uploaded media metadata
   */
  async upload(file, options = {}) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      // Validate file
      this.#validateFile(file);
      
      const { folder = 'uploads', metadata = {}, onProgress } = options;
      
      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const safeName = `${timestamp}-${this.#slugify(file.name.replace(`.${ext}`, ''))}.${ext}`;
      const storagePath = `${folder}/${user.uid}/${safeName}`;
      
      // Create storage reference
      const storageRef = ref(this.#storage, storagePath);
      
      // Upload with progress
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress, snapshot);
        });
      }
      
      await uploadTask;
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Create media record
      const mediaId = this.#generateId();
      const mediaData = {
        id: mediaId,
        name: file.name,
        originalName: file.name,
        filename: safeName,
        path: storagePath,
        url: downloadUrl,
        size: file.size,
        mimeType: file.type,
        folder,
        userId: user.uid,
        metadata: {
          ...metadata,
          uploadedAt: Timestamp.now(),
          uploadedBy: user.uid
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Add file type specific metadata
      if (file.type.startsWith('image/')) {
        const dimensions = await this.#getImageDimensions(file);
        mediaData.metadata = {
          ...mediaData.metadata,
          width: dimensions.width,
          height: dimensions.height,
          isImage: true
        };
      }
      
      // Save to Firestore
      const mediaRef = doc(this.#db, 'media', mediaId);
      await setDoc(mediaRef, mediaData);
      
      // Invalidate cache
      this.#cache.clear();
      
      console.info(`[MediaService] Uploaded: ${file.name} (${mediaId})`);
      
      return mediaData;
      
    } catch (error) {
      console.error('[MediaService] Upload failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Get media by ID
   * @param {string} mediaId - Media ID
   * @returns {Promise<Object|null>} Media metadata
   */
  async getMedia(mediaId) {
    try {
      // Check cache
      if (this.#cache.has(mediaId)) {
        return this.#cache.get(mediaId);
      }
      
      const mediaRef = doc(this.#db, 'media', mediaId);
      const mediaDoc = await getDoc(mediaRef);
      
      if (!mediaDoc.exists()) {
        return null;
      }
      
      const media = mediaDoc.data();
      this.#cache.set(mediaId, media);
      
      return media;
      
    } catch (error) {
      console.error('[MediaService] Failed to get media:', error);
      throw error;
    }
  }
  
  /**
   * List media with pagination
   * @param {Object} options - Query options
   * @param {string} options.folder - Filter by folder
   * @param {string} options.userId - Filter by user
   * @param {string} options.mimeType - Filter by mime type
   * @param {number} options.limit - Items per page
   * @param {string} options.startAfter - Pagination cursor
   * @param {string} options.orderBy - Sort field
   * @param {string} options.orderDirection - Sort direction
   * @returns {Promise<Object>} Paginated results
   */
  async listMedia(options = {}) {
    try {
      const {
        folder = null,
        userId = null,
        mimeType = null,
        limit: pageSize = 20,
        startAfter: cursor = null,
        orderBy: orderField = 'createdAt',
        orderDirection = 'desc'
      } = options;
      
      let constraints = [];
      
      // Add filters
      if (folder) {
        constraints.push(where('folder', '==', folder));
      }
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      if (mimeType) {
        constraints.push(where('mimeType', '==', mimeType));
      }
      
      // Add sorting
      constraints.push(orderBy(orderField, orderDirection));
      
      // Add pagination
      if (cursor) {
        const cursorDoc = await getDoc(doc(this.#db, 'media', cursor));
        if (cursorDoc.exists()) {
          constraints.push(startAfter(cursorDoc));
        }
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'media'), ...constraints);
      const snapshot = await getDocs(q);
      
      const items = [];
      let lastDoc = null;
      
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
        lastDoc = doc;
      });
      
      return {
        items,
        pagination: {
          limit: pageSize,
          hasMore: items.length === pageSize,
          nextCursor: lastDoc?.id || null
        }
      };
      
    } catch (error) {
      console.error('[MediaService] Failed to list media:', error);
      throw error;
    }
  }
  
  /**
   * Delete media
   * @param {string} mediaId - Media ID
   * @returns {Promise<void>}
   */
  async deleteMedia(mediaId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const media = await this.getMedia(mediaId);
      if (!media) {
        throw new Error('MEDIA_NOT_FOUND');
      }
      
      // Check permissions
      if (media.userId !== user.uid) {
        // Check if user is admin via RBAC
        if (this.#authService.rbacService) {
          const isAdmin = await this.#authService.rbacService.isSuperAdmin(user.uid);
          if (!isAdmin) {
            throw new Error('PERMISSION_DENIED');
          }
        } else {
          throw new Error('PERMISSION_DENIED');
        }
      }
      
      // Delete from storage
      const storageRef = ref(this.#storage, media.path);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      const mediaRef = doc(this.#db, 'media', mediaId);
      await deleteDoc(mediaRef);
      
      // Invalidate cache
      this.#cache.delete(mediaId);
      
      console.info(`[MediaService] Deleted: ${media.name} (${mediaId})`);
      
    } catch (error) {
      console.error('[MediaService] Delete failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Update media metadata
   * @param {string} mediaId - Media ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated media
   */
  async updateMedia(mediaId, updates) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const media = await this.getMedia(mediaId);
      if (!media) {
        throw new Error('MEDIA_NOT_FOUND');
      }
      
      // Check ownership
      if (media.userId !== user.uid) {
        const isAdmin = await this.#authService.rbacService?.isSuperAdmin(user.uid);
        if (!isAdmin) {
          throw new Error('PERMISSION_DENIED');
        }
      }
      
      const allowedUpdates = ['name', 'folder', 'metadata'];
      const filteredUpdates = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      filteredUpdates.updatedAt = Timestamp.now();
      
      const mediaRef = doc(this.#db, 'media', mediaId);
      await updateDoc(mediaRef, filteredUpdates);
      
      // Invalidate cache
      this.#cache.delete(mediaId);
      
      const updatedMedia = await this.getMedia(mediaId);
      return updatedMedia;
      
    } catch (error) {
      console.error('[MediaService] Update failed:', error);
      throw error;
    }
  }
  
  /**
   * Get signed URL for temporary access
   * @param {string} mediaId - Media ID
   * @param {number} expiresIn - Expiration in seconds
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(mediaId, expiresIn = 3600) {
    try {
      const media = await this.getMedia(mediaId);
      if (!media) {
        throw new Error('MEDIA_NOT_FOUND');
      }
      
      // For Firebase Storage, we can create a token for private files
      // This is a simplified implementation
      const storageRef = ref(this.#storage, media.path);
      const url = await getDownloadURL(storageRef);
      
      return url;
      
    } catch (error) {
      console.error('[MediaService] Failed to get signed URL:', error);
      throw error;
    }
  }
  
  /**
   * Validate file before upload
   * @private
   * @param {File} file - File to validate
   * @throws {Error} If validation fails
   */
  #validateFile(file) {
    if (!file) {
      throw new Error('NO_FILE');
    }
    
    if (file.size > this.#config.maxFileSize) {
      throw new Error(`FILE_TOO_LARGE: Max ${this.#config.maxFileSize / 1048576}MB`);
    }
    
    if (!this.#config.allowedMimeTypes.includes(file.type)) {
      throw new Error(`INVALID_FILE_TYPE: Allowed: ${this.#config.allowedMimeTypes.join(', ')}`);
    }
  }
  
  /**
   * Get image dimensions
   * @private
   * @param {File} file - Image file
   * @returns {Promise<Object>} Dimensions
   */
  #getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
  
  /**
   * Generate unique ID
   * @private
   * @returns {string} Unique ID
   */
  #generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Slugify string for safe filenames
   * @private
   * @param {string} str - Input string
   * @returns {string} Slugified string
   */
  #slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .substring(0, 100);
  }
  
  /**
   * Normalize error messages
   * @private
   * @param {Error} error - Original error
   * @returns {Error} Normalized error
   */
  #normalizeError(error) {
    const errorMap = {
      'storage/unauthorized': 'STORAGE_UNAUTHORIZED',
      'storage/canceled': 'UPLOAD_CANCELLED',
      'storage/unknown': 'STORAGE_ERROR',
      'AUTH_REQUIRED': 'AUTH_REQUIRED',
      'PERMISSION_DENIED': 'PERMISSION_DENIED',
      'MEDIA_NOT_FOUND': 'MEDIA_NOT_FOUND',
      'FILE_TOO_LARGE': 'FILE_TOO_LARGE',
      'INVALID_FILE_TYPE': 'INVALID_FILE_TYPE'
    };
    
    const message = errorMap[error.message] || error.message || 'MEDIA_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const mediaService = MediaService.getInstance();
export default mediaService;
