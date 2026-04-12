/**
 * @file workflows/feature.manifest.js
 * @description Declarative manifest for the Totistack workflows feature.
 */
export default {
  id: 'workflows',
  type: 'feature',
  name: 'Workflows',
  version: '3.0.0',
  description: 'Workflow definitions, triggers, execution runs, and operational logs.',
  dependencies: {
    features: ['auth', 'rbac', 'integrations'],
    apps: [],
  },
  collections: ['workflows', 'workflowRuns', 'workflowTriggers', 'workflowLogs'],
  services: ['workflowService'],
  routes: ['./routes.js'],
}
