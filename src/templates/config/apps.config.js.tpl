/**
 * @file apps.config.js
 * @description Configuration for installed apps
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  // Enabled apps
  enabled: {{appsList}},
  
  // App-specific configuration
  apps: {
    {{#each apps}}
    '{{id}}': {
      enabled: true,
      navVisible: true,
      order: {{@index}},
      options: {{toJSON options}}
    },
    {{/each}}
  },
  
  // Navigation order
  navigationOrder: {{appsList}},
  
  // Global app settings
  settings: {
    cacheModules: true,
    lazyLoad: true,
    preloadThreshold: 3
  }
};