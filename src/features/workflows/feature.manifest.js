/**
 * Workflow Automation Feature Manifest
 * @module features/workflow
 * @description Workflow automation engine for creating, managing, and executing automated workflows
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'workflow',
  name: 'Workflow Automation',
  version: '2.0.0',
  description: 'Visual workflow builder with triggers, actions, and conditional logic',
  
  dependencies: {
    features: ['auth', 'rbac', 'integration'],
    apps: []
  },
  
  configSchema: {
    type: 'object',
    properties: {
      maxConcurrentExecutions: { type: 'number', default: 10 },
      executionTimeout: { type: 'number', default: 300 },
      enableAuditLog: { type: 'boolean', default: true },
      webhookSecret: { type: 'string', default: '' }
    }
  },
  
  collections: [
    'workflows',
    'workflowExecutions',
    'workflowTriggers',
    'workflowActions',
    'workflowLogs'
  ],
  
  services: ['workflowEngine', 'triggerService', 'actionService', 'schedulerService'],
  
  stores: ['workflow'],
  
  hooks: ['onWorkflowTriggered', 'onWorkflowCompleted', 'onWorkflowFailed']
};