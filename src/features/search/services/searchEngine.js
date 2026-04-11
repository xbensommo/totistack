/**
 * Search Engine Service
 * @module features/search/services/searchEngine
 * @description Core search engine with full-text indexing and relevance ranking
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Search Engine Class
 */
export class SearchEngine {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Search cache */
  #cache = new Map();
  
  /** @type {Map} Term frequency index */
  #termIndex = new Map();
  
  /** @type {Map} Document frequency index */
  #docFrequency = new Map();
  
  /** @type {Array} Stop words */
  #stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
    'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with', 'was',
    'were', 'has', 'have', 'had', 'this', 'that', 'these', 'those'
  ]);
  
  /** @type {Map} Synonyms */
  #synonyms = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {SearchEngine} SearchEngine instance
   */
  static getInstance() {
    if (!globalThis.__searchEngine) {
      globalThis.__searchEngine = new SearchEngine();
    }
    return globalThis.__searchEngine;
  }
  
  /**
   * Initialize search engine
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
        defaultSearchLimit: 20,
        maxSearchLimit: 100,
        enableFuzzySearch: true,
        fuzzyThreshold: 0.6,
        indexBatchSize: 100,
        enableAnalytics: true,
        searchCacheTtl: 300,
        ...config
      };
      
      // Load synonyms
      await this.#loadSynonyms();
      
      // Load stop words from Firestore
      await this.#loadStopWords();
      
      this.#initialized = true;
      console.info('[SearchEngine] Initialized');
      
    } catch (error) {
      console.error('[SearchEngine] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Index document for search
   * @param {string} collection - Collection name
   * @param {string} documentId - Document ID
   * @param {Object} document - Document data
   * @param {Object} options - Indexing options
   * @returns {Promise<Object>} Index result
   */
  async indexDocument(collection, documentId, document, options = {}) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      // Define searchable fields
      const searchableFields = options.fields || this.#getSearchableFields(document);
      
      // Extract and tokenize text
      const text = this.#extractText(document, searchableFields);
      const tokens = this.#tokenize(text);
      
      // Generate n-grams for fuzzy search
      const ngrams = this.#generateNgrams(tokens);
      
      // Calculate TF-IDF weights
      const termWeights = this.#calculateTermWeights(tokens, collection);
      
      // Build index entry
      const indexEntry = {
        id: `${collection}_${documentId}`,
        collection,
        documentId,
        title: document.title || document.name || documentId,
        content: text.substring(0, 1000), // Store preview
        tokens,
        ngrams,
        termWeights,
        metadata: {
          indexedAt: Timestamp.now(),
          indexedBy: user.uid,
          version: options.version || 1
        }
      };
      
      // Add boost for important fields
      if (options.boost) {
        for (const [field, boost] of Object.entries(options.boost)) {
          if (document[field]) {
            const fieldText = String(document[field]);
            const fieldTokens = this.#tokenize(fieldText);
            for (const token of fieldTokens) {
              indexEntry.termWeights[token] = (indexEntry.termWeights[token] || 0) + boost;
            }
          }
        }
      }
      
      // Save to index
      const indexRef = doc(this.#db, 'searchIndex', indexEntry.id);
      await setDoc(indexRef, indexEntry);
      
      // Update term frequency index
      this.#updateTermFrequencies(tokens, collection);
      
      // Invalidate cache
      this.#cache.clear();
      
      console.debug(`[SearchEngine] Indexed ${collection}/${documentId}`);
      
      return indexEntry;
      
    } catch (error) {
      console.error('[SearchEngine] Index document failed:', error);
      throw error;
    }
  }
  
  /**
   * Delete document from index
   * @param {string} collection - Collection name
   * @param {string} documentId - Document ID
   * @returns {Promise<void>}
   */
  async deleteFromIndex(collection, documentId) {
    try {
      const indexId = `${collection}_${documentId}`;
      const indexRef = doc(this.#db, 'searchIndex', indexId);
      await deleteDoc(indexRef);
      
      this.#cache.clear();
      
      console.debug(`[SearchEngine] Deleted from index: ${collection}/${documentId}`);
      
    } catch (error) {
      console.error('[SearchEngine] Delete from index failed:', error);
      throw error;
    }
  }
  
  /**
   * Search documents
   * @param {string} queryString - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async search(queryString, options = {}) {
    try {
      const startTime = Date.now();
      
      // Check cache
      const cacheKey = this.#generateCacheKey(queryString, options);
      if (this.#cache.has(cacheKey)) {
        const cached = this.#cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.#config.searchCacheTtl * 1000) {
          return cached.results;
        }
      }
      
      // Parse query
      const parsedQuery = await this.#parseQuery(queryString);
      
      // Apply synonyms
      const expandedTerms = this.#expandSynonyms(parsedQuery.terms);
      
      // Get matching documents
      const matches = await this.#getMatchingDocuments(expandedTerms, options);
      
      // Rank results
      const ranked = await this.#rankResults(matches, expandedTerms, options);
      
      // Apply filters
      let filtered = this.#applyFilters(ranked, options.filters);
      
      // Apply pagination
      const page = options.page || 1;
      const pageSize = Math.min(
        options.pageSize || this.#config.defaultSearchLimit,
        this.#config.maxSearchLimit
      );
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      
      // Get facets
      let facets = {};
      if (options.facets) {
        facets = this.#generateFacets(filtered, options.facets);
      }
      
      // Get suggestions
      let suggestions = [];
      if (options.suggestions && filtered.length === 0) {
        suggestions = await this.#getSuggestions(queryString);
      }
      
      const results = {
        results: paginated,
        total: filtered.length,
        facets,
        suggestions,
        query: {
          original: queryString,
          parsed: parsedQuery,
          expanded: expandedTerms
        },
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize)
        },
        processingTimeMs: Date.now() - startTime
      };
      
      // Cache results
      this.#cache.set(cacheKey, {
        results,
        timestamp: Date.now()
      });
      
      // Log search for analytics
      if (this.#config.enableAnalytics) {
        await this.#logSearch(queryString, results.total, results.processingTimeMs);
      }
      
      return results;
      
    } catch (error) {
      console.error('[SearchEngine] Search failed:', error);
      throw error;
    }
  }
  
  /**
   * Get search suggestions
   * @param {string} partialQuery - Partial query
   * @returns {Promise<Array>} Suggestions
   */
  async getSuggestions(partialQuery) {
    try {
      const suggestions = await this.#getSuggestions(partialQuery);
      return suggestions;
    } catch (error) {
      console.error('[SearchEngine] Get suggestions failed:', error);
      return [];
    }
  }
  
  /**
   * Bulk index documents
   * @param {Array} documents - Documents to index
   * @returns {Promise<Object>} Bulk index result
   */
  async bulkIndex(documents) {
    try {
      const batch = writeBatch(this.#db);
      let indexed = 0;
      let failed = 0;
      
      for (const doc of documents) {
        try {
          const indexEntry = await this.indexDocument(doc.collection, doc.id, doc.data);
          const indexRef = doc(this.#db, 'searchIndex', indexEntry.id);
          batch.set(indexRef, indexEntry);
          indexed++;
        } catch (err) {
          failed++;
          console.error(`[SearchEngine] Failed to index ${doc.id}:`, err);
        }
        
        // Commit batch every 100 documents
        if (indexed % this.#config.indexBatchSize === 0) {
          await batch.commit();
        }
      }
      
      await batch.commit();
      
      return {
        indexed,
        failed,
        total: documents.length
      };
      
    } catch (error) {
      console.error('[SearchEngine] Bulk index failed:', error);
      throw error;
    }
  }
  
  /**
   * Get search analytics
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics() {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.#db, 'searchQueries'),
          orderBy('timestamp', 'desc'),
          limit(1000)
        )
      );
      
      const queries = [];
      snapshot.forEach(doc => {
        queries.push(doc.data());
      });
      
      // Calculate analytics
      const totalSearches = queries.length;
      const uniqueQueries = new Set(queries.map(q => q.query)).size;
      const zeroResults = queries.filter(q => q.resultCount === 0).length;
      const avgResults = queries.reduce((sum, q) => sum + q.resultCount, 0) / totalSearches;
      const avgTime = queries.reduce((sum, q) => sum + q.processingTimeMs, 0) / totalSearches;
      
      // Get top queries
      const queryCounts = new Map();
      for (const q of queries) {
        queryCounts.set(q.query, (queryCounts.get(q.query) || 0) + 1);
      }
      const topQueries = Array.from(queryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));
      
      return {
        totalSearches,
        uniqueQueries,
        zeroResultsRate: (zeroResults / totalSearches) * 100,
        avgResultsPerSearch: avgResults,
        avgProcessingTimeMs: avgTime,
        topQueries,
        recentQueries: queries.slice(0, 20)
      };
      
    } catch (error) {
      console.error('[SearchEngine] Get analytics failed:', error);
      return null;
    }
  }
  
  /**
   * Parse query string
   * @private
   */
  async #parseQuery(queryString) {
    const terms = this.#tokenize(queryString);
    const operators = [];
    const phrases = [];
    
    // Parse quoted phrases
    const phraseRegex = /"([^"]+)"/g;
    let match;
    while ((match = phraseRegex.exec(queryString)) !== null) {
      phrases.push(match[1]);
    }
    
    // Remove quoted phrases from terms
    const cleanQuery = queryString.replace(phraseRegex, '');
    const cleanTerms = this.#tokenize(cleanQuery);
    
    return {
      original: queryString,
      terms: [...cleanTerms, ...phrases],
      phrases,
      operators
    };
  }
  
  /**
   * Tokenize text
   * @private
   */
  #tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !this.#stopWords.has(token));
  }
  
  /**
   * Generate n-grams for fuzzy search
   * @private
   */
  #generateNgrams(tokens, n = 3) {
    const ngrams = [];
    for (const token of tokens) {
      for (let i = 0; i <= token.length - n; i++) {
        ngrams.push(token.substring(i, i + n));
      }
    }
    return [...new Set(ngrams)];
  }
  
  /**
   * Calculate term weights (TF-IDF)
   * @private
   */
  #calculateTermWeights(tokens, collection) {
    const weights = {};
    const termFreq = new Map();
    
    // Calculate term frequency
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }
    
    // Calculate TF-IDF
    const totalDocs = this.#docFrequency.get(collection)?.totalDocs || 1;
    
    for (const [term, freq] of termFreq.entries()) {
      const docFreq = this.#docFrequency.get(collection)?.terms.get(term) || 1;
      const tf = freq / tokens.length;
      const idf = Math.log(totalDocs / docFreq);
      weights[term] = tf * idf;
    }
    
    return weights;
  }
  
  /**
   * Update term frequencies
   * @private
   */
  #updateTermFrequencies(tokens, collection) {
    if (!this.#docFrequency.has(collection)) {
      this.#docFrequency.set(collection, {
        totalDocs: 0,
        terms: new Map()
      });
    }
    
    const stats = this.#docFrequency.get(collection);
    stats.totalDocs++;
    
    const uniqueTerms = new Set(tokens);
    for (const term of uniqueTerms) {
      stats.terms.set(term, (stats.terms.get(term) || 0) + 1);
    }
  }
  
  /**
   * Get matching documents
   * @private
   */
  async #getMatchingDocuments(terms, options) {
    const matches = new Map();
    
    for (const term of terms) {
      // Exact match query
      const exactQuery = query(
        collection(this.#db, 'searchIndex'),
        where('tokens', 'array-contains', term),
        limit(1000)
      );
      
      const exactSnapshot = await getDocs(exactQuery);
      
      for (const doc of exactSnapshot.docs) {
        const data = doc.data();
        const score = data.termWeights[term] || 1;
        matches.set(doc.id, {
          ...data,
          id: doc.id,
          score: (matches.get(doc.id)?.score || 0) + score
        });
      }
      
      // Fuzzy search (ngram matching)
      if (this.#config.enableFuzzySearch && term.length >= 3) {
        const ngrams = this.#generateNgrams([term]);
        
        for (const ngram of ngrams) {
          const fuzzyQuery = query(
            collection(this.#db, 'searchIndex'),
            where('ngrams', 'array-contains', ngram),
            limit(1000)
          );
          
          const fuzzySnapshot = await getDocs(fuzzyQuery);
          
          for (const doc of fuzzySnapshot.docs) {
            const data = doc.data();
            const similarity = this.#calculateSimilarity(term, data.tokens);
            
            if (similarity >= this.#config.fuzzyThreshold) {
              const score = similarity * (data.termWeights[term] || 0.5);
              matches.set(doc.id, {
                ...data,
                id: doc.id,
                score: (matches.get(doc.id)?.score || 0) + score
              });
            }
          }
        }
      }
    }
    
    return Array.from(matches.values());
  }
  
  /**
   * Rank results by relevance
   * @private
   */
  async #rankResults(matches, terms, options) {
    // Boost by recency
    const now = Date.now();
    
    for (const match of matches) {
      // Base score from term weights
      let score = match.score;
      
      // Boost by recency (if document has createdAt)
      if (match.metadata?.createdAt) {
        const docDate = match.metadata.createdAt.toDate?.() || new Date(match.metadata.createdAt);
        const daysAgo = (now - docDate.getTime()) / (1000 * 60 * 60 * 24);
        const recencyBoost = Math.max(0, 1 - daysAgo / 365); // Linear decay over 1 year
        score *= (1 + recencyBoost * 0.5);
      }
      
      // Boost by title match
      if (match.title && terms.some(term => match.title.toLowerCase().includes(term))) {
        score *= 1.5;
      }
      
      match.relevanceScore = score;
    }
    
    // Sort by relevance score
    matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply custom sorting
    if (options.sortBy === 'recent') {
      matches.sort((a, b) => {
        const dateA = a.metadata?.createdAt?.toDate?.() || new Date(0);
        const dateB = b.metadata?.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } else if (options.sortBy === 'title') {
      matches.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    
    return matches;
  }
  
  /**
   * Apply filters to results
   * @private
   */
  #applyFilters(results, filters) {
    if (!filters) return results;
    
    return results.filter(result => {
      for (const [field, value] of Object.entries(filters)) {
        const fieldValue = result[field] || result.metadata?.[field];
        
        if (Array.isArray(value)) {
          if (!value.includes(fieldValue)) {
            return false;
          }
        } else if (value !== undefined && fieldValue !== value) {
          return false;
        }
      }
      return true;
    });
  }
  
  /**
   * Generate facets
   * @private
   */
  #generateFacets(results, facetFields) {
    const facets = {};
    
    for (const field of facetFields) {
      const counts = new Map();
      
      for (const result of results) {
        const value = result[field] || result.metadata?.[field];
        if (value) {
          counts.set(value, (counts.get(value) || 0) + 1);
        }
      }
      
      facets[field] = Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
    
    return facets;
  }
  
  /**
   * Get search suggestions
   * @private
   */
  async #getSuggestions(partialQuery) {
    const suggestions = new Set();
    const tokens = this.#tokenize(partialQuery);
    
    if (tokens.length === 0) return [];
    
    const lastToken = tokens[tokens.length - 1];
    
    // Get suggestions from term index
    for (const [term] of this.#termIndex) {
      if (term.startsWith(lastToken) && term !== lastToken) {
        suggestions.add(term);
      }
    }
    
    // Get suggestions from search history
    const historySnapshot = await getDocs(
      query(
        collection(this.#db, 'searchQueries'),
        where('query', '>=', partialQuery),
        where('query', '<=', partialQuery + '\uf8ff'),
        orderBy('timestamp', 'desc'),
        limit(5)
      )
    );
    
    historySnapshot.forEach(doc => {
      suggestions.add(doc.data().query);
    });
    
    return Array.from(suggestions).slice(0, 10);
  }
  
  /**
   * Expand synonyms
   * @private
   */
  #expandSynonyms(terms) {
    const expanded = [...terms];
    
    for (const term of terms) {
      const synonyms = this.#synonyms.get(term);
      if (synonyms) {
        expanded.push(...synonyms);
      }
    }
    
    return [...new Set(expanded)];
  }
  
  /**
   * Calculate similarity between term and tokens
   * @private
   */
  #calculateSimilarity(term, tokens) {
    const termChars = term.split('');
    let maxSimilarity = 0;
    
    for (const token of tokens) {
      const tokenChars = token.split('');
      const longer = Math.max(termChars.length, tokenChars.length);
      const distance = this.#levenshteinDistance(termChars, tokenChars);
      const similarity = 1 - distance / longer;
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }
  
  /**
   * Levenshtein distance calculation
   * @private
   */
  #levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  /**
   * Extract text from document
   * @private
   */
  #extractText(document, fields) {
    const texts = [];
    
    for (const field of fields) {
      const value = document[field];
      if (value) {
        texts.push(String(value));
      }
    }
    
    return texts.join(' ');
  }
  
  /**
   * Get searchable fields from document
   * @private
   */
  #getSearchableFields(document) {
    const defaultFields = ['title', 'name', 'description', 'content', 'body'];
    const fields = [];
    
    for (const field of defaultFields) {
      if (document[field]) {
        fields.push(field);
      }
    }
    
    return fields;
  }
  
  /**
   * Load synonyms from Firestore
   * @private
   */
  async #loadSynonyms() {
    try {
      const snapshot = await getDocs(collection(this.#db, 'searchSynonyms'));
      snapshot.forEach(doc => {
        const data = doc.data();
        this.#synonyms.set(data.term, data.synonyms);
      });
    } catch (error) {
      console.warn('[SearchEngine] Failed to load synonyms:', error);
    }
  }
  
  /**
   * Load stop words from Firestore
   * @private
   */
  async #loadStopWords() {
    try {
      const snapshot = await getDocs(collection(this.#db, 'searchStopWords'));
      snapshot.forEach(doc => {
        this.#stopWords.add(doc.data().word);
      });
    } catch (error) {
      console.warn('[SearchEngine] Failed to load stop words:', error);
    }
  }
  
  /**
   * Log search for analytics
   * @private
   */
  async #logSearch(query, resultCount, processingTimeMs) {
    try {
      const user = this.#authService.getCurrentUser();
      
      const logEntry = {
        query,
        resultCount,
        processingTimeMs,
        userId: user?.uid || null,
        timestamp: Timestamp.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      };
      
      const logRef = doc(collection(this.#db, 'searchQueries'));
      await setDoc(logRef, logEntry);
      
    } catch (error) {
      console.warn('[SearchEngine] Failed to log search:', error);
    }
  }
  
  /**
   * Generate cache key
   * @private
   */
  #generateCacheKey(query, options) {
    return `${query}:${JSON.stringify(options)}`;
  }
  
  /**
   * Add synonym
   * @param {string} term - Primary term
   * @param {Array} synonyms - Synonym list
   * @returns {Promise<void>}
   */
  async addSynonym(term, synonyms) {
    const synonymRef = doc(collection(this.#db, 'searchSynonyms'));
    await setDoc(synonymRef, {
      term,
      synonyms,
      createdAt: Timestamp.now()
    });
    
    this.#synonyms.set(term, synonyms);
  }
  
  /**
   * Add stop word
   * @param {string} word - Stop word
   * @returns {Promise<void>}
   */
  async addStopWord(word) {
    const stopWordRef = doc(collection(this.#db, 'searchStopWords'));
    await setDoc(stopWordRef, {
      word,
      createdAt: Timestamp.now()
    });
    
    this.#stopWords.add(word);
  }
  
  /**
   * Reindex collection
   * @param {string} collectionName - Collection to reindex
   * @returns {Promise<Object>} Reindex result
   */
  async reindexCollection(collectionName) {
    try {
      // Get all documents from collection
      const snapshot = await getDocs(collection(this.#db, collectionName));
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({
          collection: collectionName,
          id: doc.id,
          data: doc.data()
        });
      });
      
      // Delete existing index entries
      const indexQuery = query(
        collection(this.#db, 'searchIndex'),
        where('collection', '==', collectionName)
      );
      const indexSnapshot = await getDocs(indexQuery);
      
      const batch = writeBatch(this.#db);
      indexSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      // Reindex
      const result = await this.bulkIndex(documents);
      
      return {
        collection: collectionName,
        ...result
      };
      
    } catch (error) {
      console.error('[SearchEngine] Reindex failed:', error);
      throw error;
    }
  }
}

const searchEngine = SearchEngine.getInstance();
export default searchEngine;
