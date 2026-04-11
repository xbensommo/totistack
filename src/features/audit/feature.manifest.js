/**
 * Audit Logs Feature Manifest
 * @module features/audit
 * @description Enterprise audit logging with compliance reporting and security monitoring
 * @author Microsoft Engineering Team
 * @date 2026-03-22
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export const auditLogsCollection = defineCollection({
  name: 'auditLogs',
  shard: { type: 'monthly', field: 'timestamp' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    timestamp: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    userEmail: { type: FIELD_TYPES.STRING, filterable: true },
    userRole: { type: FIELD_TYPES.STRING, filterable: true },
    ipAddress: { type: FIELD_TYPES.STRING },
    userAgent: { type: FIELD_TYPES.STRING },
    action: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    resource: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    resourceId: { type: FIELD_TYPES.STRING, filterable: true },
    oldValue: { type: FIELD_TYPES.MAP },
    newValue: { type: FIELD_TYPES.MAP },
    changes: { type: FIELD_TYPES.ARRAY },
    status: { type: FIELD_TYPES.STRING, enum: ['success', 'failure'], required: true },
    errorCode: { type: FIELD_TYPES.STRING },
    errorMessage: { type: FIELD_TYPES.STRING },
    severity: { type: FIELD_TYPES.STRING, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
    metadata: { type: FIELD_TYPES.MAP },
    requestId: { type: FIELD_TYPES.STRING },
    sessionId: { type: FIELD_TYPES.STRING }
  },
  writableFields: ['userId', 'userEmail', 'userRole', 'ipAddress', 'userAgent', 'action', 'resource', 'resourceId', 'oldValue', 'newValue', 'changes', 'status', 'errorCode', 'errorMessage', 'severity', 'metadata', 'requestId', 'sessionId'],
  indexes: [
    { fields: ['timestamp'], order: 'desc' },
    { fields: ['userId', 'timestamp'] },
    { fields: ['action', 'timestamp'] },
    { fields: ['resource', 'resourceId'] },
    { fields: ['severity', 'timestamp'] },
    { fields: ['status', 'timestamp'] }
  ]
});

export const auditRetentionPoliciesCollection = defineCollection({
  name: 'auditRetentionPolicies',
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    resource: { type: FIELD_TYPES.STRING, required: true, unique: true },
    retentionDays: { type: FIELD_TYPES.NUMBER, required: true, default: 365 },
    archiveEnabled: { type: FIELD_TYPES.BOOLEAN, default: false },
    archiveDestination: { type: FIELD_TYPES.STRING },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['retentionDays', 'archiveEnabled', 'archiveDestination'],
  indexes: [{ fields: ['resource'] }]
});

export const complianceReportsCollection = defineCollection({
  name: 'complianceReports',
  shard: { type: 'monthly', field: 'createdAt' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    name: { type: FIELD_TYPES.STRING, required: true },
    type: { type: FIELD_TYPES.STRING, enum: ['GDPR', 'HIPAA', 'SOC2', 'PCI', 'CUSTOM'], required: true },
    dateRange: {
      type: FIELD_TYPES.MAP,
      properties: {
        start: { type: FIELD_TYPES.TIMESTAMP },
        end: { type: FIELD_TYPES.TIMESTAMP }
      }
    },
    filters: { type: FIELD_TYPES.MAP },
    generatedBy: { type: FIELD_TYPES.STRING, required: true },
    generatedAt: { type: FIELD_TYPES.TIMESTAMP, required: true },
    status: { type: FIELD_TYPES.STRING, enum: ['pending', 'processing', 'completed', 'failed'] },
    downloadUrl: { type: FIELD_TYPES.STRING },
    fileSize: { type: FIELD_TYPES.NUMBER },
    recordCount: { type: FIELD_TYPES.NUMBER },
    metadata: { type: FIELD_TYPES.MAP },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['name', 'type', 'dateRange', 'filters', 'metadata'],
  updateableFields: ['status', 'downloadUrl', 'fileSize', 'recordCount', 'expiresAt'],
  indexes: [{ fields: ['generatedBy', 'generatedAt'] }, { fields: ['type', 'status'] }]
});

export default {
  id: 'audit',
  name: 'Audit Logs',
  version: '2.0.0',
  description: 'Enterprise audit logging with compliance reporting and security monitoring',
  dependencies: { features: ['auth', 'rbac'], apps: [] },
  configSchema: {
    type: 'object',
    properties: {
      logAllActions: { type: 'boolean', default: true },
      logSensitiveActions: { type: 'boolean', default: true },
      excludeHealthChecks: { type: 'boolean', default: true },
      asyncLogging: { type: 'boolean', default: true },
      retentionDays: { type: 'number', default: 365 },
      sensitiveFields: { type: 'array', default: ['password', 'token', 'secret', 'apiKey'] }
    }
  },
  collections: ['auditLogs', 'auditRetentionPolicies', 'complianceReports'],
  services: ['auditService', 'retentionService', 'complianceService'],
  stores: ['audit'],
  hooks: ['onAuditLogCreated', 'onRetentionTriggered', 'onReportGenerated']
};