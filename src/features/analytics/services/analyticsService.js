/**
 * Analytics Service
 * @module features/analytics/services/analyticsService
 * @description Core analytics service for tracking events, page views, and user behavior
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, setDoc, addDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Analytics Service Class
 */
export class AnalyticsService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Array} Event queue for batching */
  #eventQueue = [];
  
  /** @type {number} Batch flush interval */
  #flushInterval = null;
  
  /** @type {string} Current session ID */
  #sessionId = null;
  
  /** @type {number} Session start time */
  #sessionStart = null;
  
  constructor() {
    this.#db = getFirestore();
    this.#sessionId = this.#generateSessionId();
    this.#sessionStart = Date.now();
  }
  
  /**
   * Get singleton instance
   * @returns {AnalyticsService} AnalyticsService instance
   */
  static getInstance() {
    if (!globalThis.__analyticsService) {
      globalThis.__analyticsService = new AnalyticsService();
    }
    return globalThis.__analyticsService;
  }
  
  /**
   * Initialize analytics service
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
        enabled: true,
        providers: ['firebase'],
        trackEvents: true,
        trackPerformance: true,
        trackErrors: true,
        samplingRate: 1,
        anonymizeIp: true,
        ...config
      };
      
      // Set up batch flushing
      if (this.#config.trackEvents) {
        this.#flushInterval = setInterval(() => this.#flushEvents(), 5000);
        
        // Flush on page unload
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => this.#flushEvents(true));
          window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
              this.#flushEvents(true);
            }
          });
        }
      }
      
      // Track session start
      if (this.#config.enabled && this.#shouldSample()) {
        await this.trackEvent('session_start', {
          sessionId: this.#sessionId,
          timestamp: this.#sessionStart
        });
      }
      
      this.#initialized = true;
      console.info('[AnalyticsService] Initialized');
      
    } catch (error) {
      console.error('[AnalyticsService] Initialization failed:', error);
    }
  }
  
  /**
   * Check if analytics is enabled
   * @returns {boolean} Enabled status
   */
  isEnabled() {
    return this.#config.enabled && this.#shouldSample();
  }
  
  /**
   * Track an event
   * @param {string} eventName - Name of the event
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async trackEvent(eventName, eventData = {}) {
    if (!this.isEnabled() || !this.#config.trackEvents) {
      return;
    }
    
    try {
      const user = this.#authService?.getCurrentUser();
      
      const event = {
        name: eventName,
        data: this.#sanitizeData(eventData),
        timestamp: Timestamp.now(),
        sessionId: this.#sessionId,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        url: typeof window !== 'undefined' ? window.location.href : null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null
      };
      
      this.#eventQueue.push(event);
      
      // Flush immediately for critical events
      const criticalEvents = ['error', 'purchase', 'signup', 'login'];
      if (criticalEvents.includes(eventName)) {
        await this.#flushEvents();
      }
      
    } catch (error) {
      console.error('[AnalyticsService] Track event failed:', error);
    }
  }
  
  /**
   * Track page view
   * @param {Object} pageData - Page view data
   * @returns {Promise<void>}
   */
  async trackPageView(pageData = {}) {
    await this.trackEvent('page_view', {
      path: pageData.path,
      name: pageData.name,
      query: pageData.query,
      params: pageData.params,
      referrer: pageData.referrer,
      title: typeof document !== 'undefined' ? document.title : null,
      isInitial: pageData.isInitial || false
    });
  }
  
  /**
   * Track user engagement
   * @param {string} action - Engagement action
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<void>}
   */
  async trackEngagement(action, metadata = {}) {
    await this.trackEvent('engagement', {
      action,
      ...metadata,
      timeOnPage: this.#getTimeOnPage()
    });
  }
  
  /**
   * Track error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {Promise<void>}
   */
  async trackError(error, context = {}) {
    if (!this.#config.trackErrors) {
      return;
    }
    
    await this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }
  
  /**
   * Track performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} tags - Additional tags
   * @returns {Promise<void>}
   */
  async trackPerformance(metric, value, tags = {}) {
    if (!this.#config.trackPerformance) {
      return;
    }
    
    await this.trackEvent('performance', {
      metric,
      value,
      ...tags
    });
  }
  
  /**
   * Identify user for analytics
   * @param {string} userId - User ID
   * @param {Object} traits - User traits
   * @returns {Promise<void>}
   */
  async identifyUser(userId, traits = {}) {
    if (!this.isEnabled()) {
      return;
    }
    
    await this.trackEvent('identify', {
      userId,
      traits: this.#sanitizeData(traits)
    });
  }
  
  /**
   * Reset session
   * @returns {Promise<void>}
   */
  async resetSession() {
    await this.trackEvent('session_end', {
      sessionId: this.#sessionId,
      duration: Date.now() - this.#sessionStart
    });
    
    this.#sessionId = this.#generateSessionId();
    this.#sessionStart = Date.now();
    
    await this.trackEvent('session_start', {
      sessionId: this.#sessionId,
      timestamp: this.#sessionStart
    });
  }
  
  /**
   * Get analytics data for dashboard
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(options = {}) {
    const { startDate, endDate, eventName, limit = 100 } = options;
    
    try {
      // This would be a more complex query in production
      // For now, return a placeholder structure
      return {
        overview: {
          totalEvents: 0,
          uniqueUsers: 0,
          totalSessions: 0,
          averageSessionDuration: 0
        },
        topEvents: [],
        userActivity: [],
        retention: {}
      };
      
    } catch (error) {
      console.error('[AnalyticsService] Get analytics failed:', error);
      return null;
    }
  }
  
  /**
   * Flush events queue to Firestore
   * @private
   * @param {boolean} sync - Force synchronous flush
   */
  async #flushEvents(sync = false) {
    if (this.#eventQueue.length === 0) {
      return;
    }
    
    const events = [...this.#eventQueue];
    this.#eventQueue = [];
    
    try {
      const batch = writeBatch(this.#db);
      
      for (const event of events) {
        const eventRef = doc(collection(this.#db, 'analyticsEvents'));
        batch.set(eventRef, event);
      }
      
      await batch.commit();
      
      console.debug(`[AnalyticsService] Flushed ${events.length} events`);
      
    } catch (error) {
      console.error('[AnalyticsService] Flush failed:', error);
      // Re-queue events on failure
      this.#eventQueue.unshift(...events);
    }
  }
  
  /**
   * Sanitize data for storage
   * @private
   * @param {Object} data - Data to sanitize
   * @returns {Object} Sanitized data
   */
  #sanitizeData(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive data
      if (['password', 'token', 'secret', 'key'].some(sensitive => 
        key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }
      
      // Handle nested objects
      if (value && typeof value === 'object' && !(value instanceof Date)) {
        sanitized[key] = this.#sanitizeData(value);
        continue;
      }
      
      sanitized[key] = value;
    }
    
    return sanitized;
  }
  
  /**
   * Check if event should be sampled
   * @private
   * @returns {boolean} Should sample
   */
  #shouldSample() {
    return Math.random() <= this.#config.samplingRate;
  }
  
  /**
   * Get time on page
   * @private
   * @returns {number} Time in milliseconds
   */
  #getTimeOnPage() {
    if (typeof performance === 'undefined') {
      return 0;
    }
    return performance.now();
  }
  
  /**
   * Generate session ID
   * @private
   * @returns {string} Session ID
   */
  #generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.#flushInterval) {
      clearInterval(this.#flushInterval);
    }
    this.#flushEvents(true);
  }
}

const analyticsService = AnalyticsService.getInstance();
export default analyticsService;
