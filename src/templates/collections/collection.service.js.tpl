/**
 * @file service.js
 * @description Service layer for {{collectionName}} collection
 * @date 2026-03-22
 * @author Totistack Team
 */

import { useShardProvider } from '@xbensommo/shard-provider';
import { useAuthStore } from '../../../../app/stores/auth.store.js';
import collectionDefinition from './definition.js';

/**
 * Service class for {{collectionName}} operations
 */
class {{componentName}}Service {
  constructor() {
    this.provider = null;
    this.collection = null;
    this.definition = collectionDefinition;
    this.init();
  }
  
  /**
   * Initialize the service with shard provider
   */
  async init() {
    if (this.definition.provider === 'firestore') {
      const shardProvider = useShardProvider();
      this.provider = shardProvider;
      this.collection = shardProvider.collection(this.definition.collectionPath);
    }
  }
  
  /**
   * Get all items with optional filters
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options (limit, orderBy)
   * @returns {Promise<Array>} List of items
   */
  async getAll(filters = {}, options = {}) {
    try {
      let query = this.collection;
      
      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        query = query.where(field, '==', value);
      });
      
      // Apply ordering
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching {{collectionName}}:', error);
      throw error;
    }
  }
  
  /**
   * Get a single item by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Item or null if not found
   */
  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error fetching {{collectionName}} ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new item
   * @param {Object} data - Item data
   * @returns {Promise<Object>} Created item with ID
   */
  async create(data) {
    try {
      const authStore = useAuthStore();
      
      // Add metadata
      const enrichedData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: authStore.user?.uid,
        updatedBy: authStore.user?.uid
      };
      
      // Execute beforeCreate hook
      const processedData = await this.definition.hooks?.beforeCreate(enrichedData) || enrichedData;
      
      // Create document
      const docRef = await this.collection.add(processedData);
      const doc = await docRef.get();
      const result = {
        id: docRef.id,
        ...doc.data()
      };
      
      // Execute afterCreate hook
      await this.definition.hooks?.afterCreate(result);
      
      return result;
    } catch (error) {
      console.error('Error creating {{collectionName}}:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing item
   * @param {string} id - Document ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated item
   */
  async update(id, data) {
    try {
      const authStore = useAuthStore();
      
      // Add metadata
      const enrichedData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: authStore.user?.uid
      };
      
      // Execute beforeUpdate hook
      const processedData = await this.definition.hooks?.beforeUpdate(id, enrichedData) || enrichedData;
      
      // Update document
      await this.collection.doc(id).update(processedData);
      
      // Fetch updated document
      const doc = await this.collection.doc(id).get();
      const result = {
        id,
        ...doc.data()
      };
      
      // Execute afterUpdate hook
      await this.definition.hooks?.afterUpdate(id, result);
      
      return result;
    } catch (error) {
      console.error(`Error updating {{collectionName}} ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an item
   * @param {string} id - Document ID
   * @param {boolean} hardDelete - Whether to permanently delete
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, hardDelete = false) {
    try {
      // Execute beforeDelete hook
      const shouldDelete = await this.definition.hooks?.beforeDelete(id);
      if (shouldDelete === false) return false;
      
      if (hardDelete || !this.definition.settings.softDelete) {
        // Hard delete
        await this.collection.doc(id).delete();
      } else {
        // Soft delete
        const authStore = useAuthStore();
        await this.collection.doc(id).update({
          deletedAt: new Date().toISOString(),
          deletedBy: authStore.user?.uid
        });
      }
      
      // Execute afterDelete hook
      await this.definition.hooks?.afterDelete(id);
      
      return true;
    } catch (error) {
      console.error(`Error deleting {{collectionName}} ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Restore a soft-deleted item
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Restored item
   */
  async restore(id) {
    try {
      await this.collection.doc(id).update({
        deletedAt: null,
        deletedBy: null
      });
      
      const doc = await this.collection.doc(id).get();
      return {
        id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error restoring {{collectionName}} ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Subscribe to real-time updates
   * @param {Function} callback - Callback function
   * @param {Object} filters - Query filters
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback, filters = {}) {
    let query = this.collection;
    
    Object.entries(filters).forEach(([field, value]) => {
      query = query.where(field, '==', value);
    });
    
    return query.onSnapshot((snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    });
  }
}

// Export singleton instance
export const {{componentName}}Service = new {{componentName}}Service();
export default {{componentName}}Service;