/**
 * Event Tracker Service
 * @module features/analytics/services/eventTracker
 * @description High-level event tracking with automatic DOM event listeners
 * @author Totistack Team
 * @date 2026-03-22
 */

/**
 * Event Tracker Class
 */
export class EventTracker {
  /** @type {Object} Analytics service */
  #analytics = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {Array} Registered event listeners */
  #listeners = [];
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /**
   * Get singleton instance
   * @returns {EventTracker} EventTracker instance
   */
  static getInstance() {
    if (!globalThis.__eventTracker) {
      globalThis.__eventTracker = new EventTracker();
    }
    return globalThis.__eventTracker;
  }
  
  /**
   * Initialize event tracker
   * @param {Object} config - Configuration
   * @param {Object} analyticsService - Analytics service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, analyticsService) {
    if (this.#initialized) {
      return;
    }
    
    this.#analytics = analyticsService;
    this.#config = {
      trackClicks: true,
      trackFormSubmissions: true,
      trackDownloads: true,
      trackOutboundLinks: true,
      clickSelector: 'a, button, [role="button"]',
      ...config
    };
    
    if (typeof window !== 'undefined') {
      this.#setupAutoTracking();
    }
    
    this.#initialized = true;
    console.info('[EventTracker] Initialized');
  }
  
  /**
   * Set up automatic tracking for DOM events
   * @private
   */
  #setupAutoTracking() {
    if (this.#config.trackClicks) {
      this.#trackClicks();
    }
    
    if (this.#config.trackFormSubmissions) {
      this.#trackForms();
    }
    
    if (this.#config.trackOutboundLinks) {
      this.#trackOutboundLinks();
    }
    
    if (this.#config.trackDownloads) {
      this.#trackDownloads();
    }
  }
  
  /**
   * Track click events
   * @private
   */
  #trackClicks() {
    const handler = (event) => {
      const target = event.target.closest(this.#config.clickSelector);
      if (!target) return;
      
      const clickData = {
        element: target.tagName,
        id: target.id || null,
        class: target.className || null,
        text: target.innerText?.substring(0, 100) || null,
        href: target.href || null,
        role: target.getAttribute('role') || null,
        'data-track': target.getAttribute('data-track') || null
      };
      
      this.#analytics.trackEngagement('click', clickData);
    };
    
    document.addEventListener('click', handler);
    this.#listeners.push({ type: 'click', handler });
  }
  
  /**
   * Track form submissions
   * @private
   */
  #trackForms() {
    const handler = (event) => {
      const form = event.target;
      if (!form.tagName === 'FORM') return;
      
      const formData = {
        formId: form.id || null,
        formName: form.name || null,
        formAction: form.action || null,
        formMethod: form.method || null,
        fields: Array.from(form.elements)
          .filter(el => el.name)
          .map(el => ({
            name: el.name,
            type: el.type,
            value: el.type !== 'password' ? el.value : '[REDACTED]'
          }))
      };
      
      this.#analytics.trackEngagement('form_submit', formData);
    };
    
    document.addEventListener('submit', handler);
    this.#listeners.push({ type: 'submit', handler });
  }
  
  /**
   * Track outbound links
   * @private
   */
  #trackOutboundLinks() {
    const handler = (event) => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;
      
      const url = new URL(link.href);
      const currentHost = window.location.hostname;
      
      if (url.hostname !== currentHost) {
        const outboundData = {
          url: link.href,
          domain: url.hostname,
          text: link.innerText?.substring(0, 100) || null,
          target: link.target || null
        };
        
        this.#analytics.trackEngagement('outbound_link', outboundData);
      }
    };
    
    document.addEventListener('click', handler);
    this.#listeners.push({ type: 'click:outbound', handler });
  }
  
  /**
   * Track downloads
   * @private
   */
  #trackDownloads() {
    const downloadExtensions = /\.(pdf|doc|docx|xls|xlsx|zip|rar|tar|gz|exe|dmg|apk)$/i;
    
    const handler = (event) => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;
      
      if (downloadExtensions.test(link.href)) {
        const downloadData = {
          url: link.href,
          filename: link.href.split('/').pop(),
          text: link.innerText?.substring(0, 100) || null
        };
        
        this.#analytics.trackEngagement('download', downloadData);
      }
    };
    
    document.addEventListener('click', handler);
    this.#listeners.push({ type: 'click:download', handler });
  }
  
  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   * @returns {Promise<void>}
   */
  async trackCustom(eventName, data = {}) {
    await this.#analytics.trackEvent(`custom_${eventName}`, data);
  }
  
  /**
   * Track user action
   * @param {string} action - Action name
   * @param {Object} metadata - Action metadata
   * @returns {Promise<void>}
   */
  async trackAction(action, metadata = {}) {
    await this.#analytics.trackEngagement(action, metadata);
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    for (const { type, handler } of this.#listeners) {
      document.removeEventListener(type, handler);
    }
    this.#listeners = [];
  }
}

const eventTracker = EventTracker.getInstance();
export default eventTracker;