/**
 * @file forms/feature.manifest.js
 * @description Declarative manifest for the Totistack forms feature.
 */
export default {
  id: 'forms',
  type: 'feature',
  name: 'Forms',
  version: '3.0.0',
  description: 'Form builder, public rendering, submissions, and submission automation hooks.',
  dependencies: {
    features: ['auth', 'rbac', 'workflows', 'integrations', 'media'],
    apps: [],
  },
  collections: ['forms', 'formFields', 'formSubmissions', 'formWebhooks'],
  services: ['formsService'],
  routes: ['./routes.js'],
}
