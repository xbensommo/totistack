/**
 * @file store.js
 * @description Pinia store for {{collectionName}} collection
 * @date 2026-03-22
 * @author Totistack Team
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {{componentName}}Service from './service.js';

export const use{{componentName}}Store = defineStore('{{storeName}}', () => {
  // State
  const items = ref([]);
  const currentItem = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({});
  const pagination = ref({
    page: 1,
    limit: 25,
    total: 0
  });
  
  // Getters
  const hasItems = computed(() => items.value.length > 0);
  const itemCount = computed(() => items.value.length);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  
  /**
   * Fetch all items with filters
   */
  async function fetchItems() {
    loading.value = true;
    error.value = null;
    
    try {
      items.value = await {{componentName}}Service.getAll(filters.value, {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: pagination.value.limit
      });
      pagination.value.total = items.value.length;
    } catch (err) {
      error.value = err.message;
      console.error('Failed to fetch {{collectionName}}:', err);
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Fetch a single item by ID
   * @param {string} id - Item ID
   */
  async function fetchItem(id) {
    loading.value = true;
    error.value = null;
    
    try {
      currentItem.value = await {{componentName}}Service.getById(id);
    } catch (err) {
      error.value = err.message;
      console.error(`Failed to fetch {{collectionName}} ${id}:`, err);
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Create a new item
   * @param {Object} data - Item data
   * @returns {Promise<Object>} Created item
   */
  async function createItem(data) {
    loading.value = true;
    error.value = null;
    
    try {
      const newItem = await {{componentName}}Service.create(data);
      items.value.unshift(newItem);
      pagination.value.total++;
      return newItem;
    } catch (err) {
      error.value = err.message;
      console.error('Failed to create {{collectionName}}:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Update an existing item
   * @param {string} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated item
   */
  async function updateItem(id, data) {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedItem = await {{componentName}}Service.update(id, data);
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = updatedItem;
      }
      if (currentItem.value?.id === id) {
        currentItem.value = updatedItem;
      }
      return updatedItem;
    } catch (err) {
      error.value = err.message;
      console.error(`Failed to update {{collectionName}} ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Delete an item
   * @param {string} id - Item ID
   * @param {boolean} hardDelete - Whether to permanently delete
   * @returns {Promise<boolean>} Success status
   */
  async function deleteItem(id, hardDelete = false) {
    loading.value = true;
    error.value = null;
    
    try {
      const success = await {{componentName}}Service.delete(id, hardDelete);
      if (success) {
        items.value = items.value.filter(item => item.id !== id);
        pagination.value.total--;
        if (currentItem.value?.id === id) {
          currentItem.value = null;
        }
      }
      return success;
    } catch (err) {
      error.value = err.message;
      console.error(`Failed to delete {{collectionName}} ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Restore a soft-deleted item
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Restored item
   */
  async function restoreItem(id) {
    loading.value = true;
    error.value = null;
    
    try {
      const restoredItem = await {{componentName}}Service.restore(id);
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = restoredItem;
      }
      return restoredItem;
    } catch (err) {
      error.value = err.message;
      console.error(`Failed to restore {{collectionName}} ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Set filters and refresh items
   * @param {Object} newFilters - New filter values
   */
  async function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
    await fetchItems();
  }
  
  /**
   * Clear all filters
   */
  async function clearFilters() {
    filters.value = {};
    await fetchItems();
  }
  
  /**
   * Reset store state
   */
  function reset() {
    items.value = [];
    currentItem.value = null;
    loading.value = false;
    error.value = null;
    filters.value = {};
    pagination.value = {
      page: 1,
      limit: 25,
      total: 0
    };
  }
  
  // Subscribe to real-time updates
  let unsubscribe = null;
  
  function subscribe() {
    if (unsubscribe) unsubscribe();
    unsubscribe = {{componentName}}Service.subscribe((updatedItems) => {
      items.value = updatedItems;
      pagination.value.total = updatedItems.length;
    }, filters.value);
  }
  
  function unsubscribeFromUpdates() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }
  
  // Return store
  return {
    // State
    items,
    currentItem,
    loading,
    error,
    filters,
    pagination,
    
    // Getters
    hasItems,
    itemCount,
    isLoading,
    hasError,
    
    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    restoreItem,
    setFilters,
    clearFilters,
    reset,
    subscribe,
    unsubscribeFromUpdates
  };
});