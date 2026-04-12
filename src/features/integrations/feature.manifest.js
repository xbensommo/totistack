/**
 * @file integrations/feature.manifest.js
 * @description Declarative manifest for the Totistack integrations feature.
 */
export default {
  id: 'integrations',
  type: 'feature',
  name: 'Integrations',
  version: '3.0.0',
  description: 'Third-party connections, webhook management, credential storage metadata, and connection health reporting.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: [],
  },
  collections: ['integrations', 'integrationWebhooks', 'integrationLogs'],
  services: ['integrationsService'],
  routes: ['./routes.js'],
}
