/**
 * Search Pinia Store
 * @module features/search/stores/searchStore
 * @description Pinia store for search engine state management
 * @author Totistack Team
 * @date 2026-03-22
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import searchEngine from '../services/searchEngine';

/**
 * Create search Pinia store
 * @param {Object} pinia - Pinia instance
 * @returns {Object} Pinia store
 */
export const createSearchStore = (pinia) => {
  return defineStore('search', () => {
    // State
    const query = ref('');
    const results = ref([]);
    const facets = ref({});
    const suggestions = ref([]);
    const recentSearches = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const totalCount = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const filters = ref({});
    const sortBy = ref('relevance');
    const searchHistory = ref([]);
    
    // Computed
    const hasResults = computed(() => results.value.length > 0);
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));
    const emptyQuery = computed(() => !query.value || query.value.trim().length === 0);
    
    const searchStats = computed(() => ({
      total: totalCount.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      totalPages: totalPages.value,
      processingTimeMs: 0
    }));
    
    const activeFilters = computed(() => {
      const active = [];
      for (const [field, values] of Object.entries(filters.value)) {
        if (Array.isArray(values) && values.length > 0) {
          active.push({ field, values });
        } else if (values) {
          active.push({ field, value: values });
        }
      }
      return active;
    });
    
    // Actions
    /**
     * Execute search
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search results
     */
    const search = async (options = {}) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        const searchQuery = options.query || query.value;
        const searchFilters = { ...filters.value, ...options.filters };
        const page = options.page || currentPage.value;
        const size = options.pageSize || pageSize.value;
        const sort = options.sortBy || sortBy.value;
        
        if (!searchQuery || searchQuery.trim().length === 0) {
          results.value = [];
          totalCount.value = 0;
          return { results: [], total: 0 };
        }
        
        const response = await searchEngine.search(searchQuery, {
          filters: searchFilters,
          page,
          pageSize: size,
          sortBy: sort,
          facets: options.facets || true,
          suggestions: options.suggestions || true
        });
        
        results.value = response.results;
        totalCount.value = response.total;
        facets.value = response.facets || {};
        suggestions.value = response.suggestions || [];
        
        // Add to recent searches
        if (searchQuery && !recentSearches.value.includes(searchQuery)) {
          recentSearches.value.unshift(searchQuery);
          if (recentSearches.value.length > 10) {
            recentSearches.value.pop();
          }
        }
        
        // Add to search history
        searchHistory.value.unshift({
          query: searchQuery,
          timestamp: Date.now(),
          resultCount: response.total
        });
        
        if (searchHistory.value.length > 50) {
          searchHistory.value.pop();
        }
        
        return response;
        
      } catch (err) {
        error.value = err.message;
        console.error('[SearchStore] Search failed:', err);
        return { results: [], total: 0 };
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Get search suggestions
     * @param {string} partialQuery - Partial query
     * @returns {Promise<Array>} Suggestions
     */
    const getSuggestions = async (partialQuery) => {
      if (!partialQuery || partialQuery.length < 2) {
        suggestions.value = [];
        return [];
      }
      
      try {
        const response = await searchEngine.getSuggestions(partialQuery);
        suggestions.value = response;
        return response;
      } catch (err) {
        console.error('[SearchStore] Get suggestions failed:', err);
        return [];
      }
    };
    
    /**
     * Add filter
     * @param {string} field - Filter field
     * @param {*} value - Filter value
     */
    const addFilter = (field, value) => {
      if (!filters.value[field]) {
        filters.value[field] = [];
      }
      
      if (Array.isArray(filters.value[field])) {
        if (!filters.value[field].includes(value)) {
          filters.value[field].push(value);
        }
      } else {
        filters.value[field] = value;
      }
      
      currentPage.value = 1;
      search();
    };
    
    /**
     * Remove filter
     * @param {string} field - Filter field
     * @param {*} value - Filter value (optional)
     */
    const removeFilter = (field, value = null) => {
      if (value === null) {
        delete filters.value[field];
      } else if (Array.isArray(filters.value[field])) {
        filters.value[field] = filters.value[field].filter(v => v !== value);
        if (filters.value[field].length === 0) {
          delete filters.value[field];
        }
      } else if (filters.value[field] === value) {
        delete filters.value[field];
      }
      
      currentPage.value = 1;
      search();
    };
    
    /**
     * Clear all filters
     */
    const clearFilters = () => {
      filters.value = {};
      currentPage.value = 1;
      search();
    };
    
    /**
     * Set page
     * @param {number} page - Page number
     */
    const setPage = (page) => {
      currentPage.value = page;
      search();
    };
    
    /**
     * Set page size
     * @param {number} size - Page size
     */
    const setPageSize = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      search();
    };
    
    /**
     * Set sort order
     * @param {string} sort - Sort field
     */
    const setSort = (sort) => {
      sortBy.value = sort;
      currentPage.value = 1;
      search();
    };
    
    /**
     * Clear search
     */
    const clearSearch = () => {
      query.value = '';
      results.value = [];
      totalCount.value = 0;
      currentPage.value = 1;
      filters.value = {};
      error.value = null;
    };
    
    /**
     * Index document
     * @param {string} collection - Collection name
     * @param {string} documentId - Document ID
     * @param {Object} document - Document data
     * @returns {Promise<Object>} Index result
     */
    const indexDocument = async (collection, documentId, document) => {
      try {
        return await searchEngine.indexDocument(collection, documentId, document);
      } catch (err) {
        console.error('[SearchStore] Index document failed:', err);
        throw err;
      }
    };
    
    /**
     * Delete from index
     * @param {string} collection - Collection name
     * @param {string} documentId - Document ID
     * @returns {Promise<void>}
     */
    const deleteFromIndex = async (collection, documentId) => {
      try {
        await searchEngine.deleteFromIndex(collection, documentId);
      } catch (err) {
        console.error('[SearchStore] Delete from index failed:', err);
        throw err;
      }
    };
    
    /**
     * Get search analytics
     * @returns {Promise<Object>} Analytics data
     */
    const getAnalytics = async () => {
      try {
        return await searchEngine.getAnalytics();
      } catch (err) {
        console.error('[SearchStore] Get analytics failed:', err);
        return null;
      }
    };
    
    /**
     * Clear search history
     */
    const clearHistory = () => {
      searchHistory.value = [];
      recentSearches.value = [];
    };
    
    return {
      // State
      query,
      results,
      facets,
      suggestions,
      recentSearches,
      isLoading,
      error,
      totalCount,
      currentPage,
      pageSize,
      filters,
      sortBy,
      searchHistory,
      
      // Computed
      hasResults,
      totalPages,
      emptyQuery,
      searchStats,
      activeFilters,
      
      // Actions
      search,
      getSuggestions,
      addFilter,
      removeFilter,
      clearFilters,
      setPage,
      setPageSize,
      setSort,
      clearSearch,
      indexDocument,
      deleteFromIndex,
      getAnalytics,
      clearHistory
    };
  })(pinia);
};
