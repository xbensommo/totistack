/**
 * Integration Feature Manifest
 * @module features/integration
 * @description Third-party integrations management for connecting external services
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'integration',
  name: 'Third-Party Integrations',
  version: '2.0.0',
  description: 'Manage third-party service integrations, API keys, webhooks, and connectors',
  
  // Dependencies
  dependencies: {
    features: ['auth', 'rbac'],
    apps: []
  },
  
  // Configuration schema
  configSchema: {
    type: 'object',
    properties: {
      providers: {
        type: 'array',
        description: 'Enabled integration providers',
        default: []
      },
      webhookSecret: {
        type: 'string',
        description: 'Global webhook signing secret',
        default: ''
      },
      encryptionKey: {
        type: 'string',
        description: 'Key for encrypting sensitive credentials',
        default: ''
      }
    }
  },
  
  // Collections provided
  collections: ['integrations', 'webhooks', 'integrationLogs'],
  
  // Services provided
  services: ['integrationService', 'webhookService', 'oauthService'],
  
  // Store modules
  stores: ['integration'],
  
  // Hooks
  hooks: ['onIntegrationCreate', 'onWebhookReceive', 'onIntegrationError']
};