/**
 * Analytics Feature Manifest
 * @module features/analytics
 * @description Analytics and tracking feature for monitoring user behavior,
 *              events, and application performance.
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'analytics',
  name: 'Analytics & Tracking',
  version: '2.0.0',
  description: 'User behavior tracking, event analytics, and performance monitoring',
  
  // Dependencies
  dependencies: {
    features: ['auth'],
    apps: []
  },
  
  // Configuration schema
  configSchema: {
    type: 'object',
    properties: {
      enabled: {
        type: 'boolean',
        default: true
      },
      providers: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['firebase', 'google', 'mixpanel', 'segment']
        },
        default: ['firebase']
      },
      trackEvents: {
        type: 'boolean',
        default: true
      },
      trackPerformance: {
        type: 'boolean',
        default: true
      },
      trackErrors: {
        type: 'boolean',
        default: true
      },
      samplingRate: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        default: 1
      },
      anonymizeIp: {
        type: 'boolean',
        default: true
      }
    }
  },
  
  // Services provided
  services: ['analyticsService', 'eventTracker', 'performanceTracker'],
  
  // Store modules
  stores: ['analytics'],
  
  // Hooks
  hooks: ['onEventTrack', 'onPageView', 'onErrorTrack'],
  
  // Collections
  collections: ['analyticsEvents', 'analyticsSessions']
};

