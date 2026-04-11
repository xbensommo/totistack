/**
 * @file features.config.js
 * @description Configuration for installed features
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  // Enabled features
  enabled: {{featuresList}},
  
  // Feature-specific configuration
  features: {
    {{#each features}}
    '{{id}}': {
      enabled: true,
      options: {{toJSON options}}
    },
    {{/each}}
  },
  
  // Auth configuration
  auth: {
    mode: 'firebase',
    redirectOnLogin: '/dashboard',
    redirectOnLogout: '/login',
    sessionTimeout: 3600, // seconds
    rememberMe: true,
    passwordResetEnabled: true,
    emailVerificationRequired: false,
    mfaEnabled: false
  },
  
  // Analytics configuration
  analytics: {
    enabled: true,
    provider: 'firebase',
    trackPageViews: true,
    trackEvents: true,
    anonymizeIp: true
  },
  
  // Search configuration
  search: {
    enabled: true,
    provider: 'firestore',
    debounceMs: 300,
    minChars: 2,
    maxResults: 20
  },
  
  // Media configuration
  media: {
    enabled: true,
    storage: 'firebase',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    thumbnailSizes: {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 800, height: 800 }
    }
  },
  
  // Workflow configuration
  workflows: {
    enabled: false,
    autoSave: true,
    versioning: true
  }
};