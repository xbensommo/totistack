/**
 * Support/Ticketing System Feature Manifest
 * @module features/support
 * @description Enterprise support ticketing with SLA management, knowledge base, and customer satisfaction
 * @author Microsoft Engineering Team
 * @date 2026-03-22
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export const ticketsCollection = defineCollection({
  name: 'tickets',
  shard: { type: 'none' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    ticketNumber: { type: FIELD_TYPES.STRING, required: true, unique: true },
    subject: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    description: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    status: {
      type: FIELD_TYPES.STRING,
      enum: ['new', 'open', 'pending', 'resolved', 'closed'],
      default: 'new'
    },
    priority: {
      type: FIELD_TYPES.STRING,
      enum: ['low', 'medium', 'high', 'urgent', 'critical'],
      default: 'medium'
    },
    category: { type: FIELD_TYPES.STRING, filterable: true },
    subcategory: { type: FIELD_TYPES.STRING },
    createdBy: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    assignedTo: { type: FIELD_TYPES.STRING, filterable: true },
    assignedTeam: { type: FIELD_TYPES.STRING },
    sla: {
      type: FIELD_TYPES.MAP,
      properties: {
        responseDue: { type: FIELD_TYPES.TIMESTAMP },
        resolutionDue: { type: FIELD_TYPES.TIMESTAMP },
        respondedAt: { type: FIELD_TYPES.TIMESTAMP },
        resolvedAt: { type: FIELD_TYPES.TIMESTAMP },
        breached: { type: FIELD_TYPES.BOOLEAN }
      }
    },
    satisfaction: {
      type: FIELD_TYPES.MAP,
      properties: {
        rating: { type: FIELD_TYPES.NUMBER, min: 1, max: 5 },
        comment: { type: FIELD_TYPES.STRING },
        submittedAt: { type: FIELD_TYPES.TIMESTAMP }
      }
    },
    attachments: { type: FIELD_TYPES.ARRAY },
    tags: { type: FIELD_TYPES.ARRAY, filterable: true },
    metadata: { type: FIELD_TYPES.MAP },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP },
    closedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['subject', 'description', 'category', 'subcategory', 'priority', 'assignedTo', 'assignedTeam', 'tags', 'metadata'],
  updateableFields: ['status', 'assignedTo', 'assignedTeam', 'sla', 'satisfaction'],
  indexes: [
    { fields: ['ticketNumber'], unique: true },
    { fields: ['createdBy', 'status'] },
    { fields: ['assignedTo', 'status'] },
    { fields: ['priority', 'status'] },
    { fields: ['status', 'createdAt'] }
  ],
  search: { mode: 'token-array', fields: ['subject', 'description', 'ticketNumber'] }
});

export const ticketMessagesCollection = defineCollection({
  name: 'ticketMessages',
  shard: { type: 'none' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    ticketId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    direction: { type: FIELD_TYPES.STRING, enum: ['inbound', 'outbound'], required: true },
    message: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    attachments: { type: FIELD_TYPES.ARRAY },
    isInternal: { type: FIELD_TYPES.BOOLEAN, default: false },
    metadata: { type: FIELD_TYPES.MAP },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true }
  },
  writableFields: ['ticketId', 'userId', 'direction', 'message', 'attachments', 'isInternal', 'metadata'],
  indexes: [
    { fields: ['ticketId', 'createdAt'] },
    { fields: ['userId', 'createdAt'] }
  ],
  search: { mode: 'token-array', fields: ['message'] }
});

export const knowledgeBaseArticlesCollection = defineCollection({
  name: 'knowledgeBaseArticles',
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    title: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    content: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    category: { type: FIELD_TYPES.STRING, filterable: true },
    tags: { type: FIELD_TYPES.ARRAY },
    views: { type: FIELD_TYPES.NUMBER, default: 0 },
    helpful: { type: FIELD_TYPES.NUMBER, default: 0 },
    notHelpful: { type: FIELD_TYPES.NUMBER, default: 0 },
    status: { type: FIELD_TYPES.STRING, enum: ['draft', 'published', 'archived'], default: 'draft' },
    author: { type: FIELD_TYPES.STRING },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP },
    publishedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['title', 'content', 'category', 'tags', 'status'],
  updateableFields: ['views', 'helpful', 'notHelpful', 'publishedAt'],
  indexes: [{ fields: ['status', 'category'] }, { fields: ['views'], order: 'desc' }],
  search: { mode: 'token-array', fields: ['title', 'content', 'tags'] }
});

export const slaPoliciesCollection = defineCollection({
  name: 'slaPolicies',
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    name: { type: FIELD_TYPES.STRING, required: true },
    priority: { type: FIELD_TYPES.STRING, required: true, enum: ['low', 'medium', 'high', 'urgent', 'critical'] },
    responseTimeHours: { type: FIELD_TYPES.NUMBER, required: true },
    resolutionTimeHours: { type: FIELD_TYPES.NUMBER, required: true },
    isDefault: { type: FIELD_TYPES.BOOLEAN, default: false },
    isActive: { type: FIELD_TYPES.BOOLEAN, default: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['name', 'priority', 'responseTimeHours', 'resolutionTimeHours', 'isDefault', 'isActive'],
  indexes: [{ fields: ['priority'] }, { fields: ['isActive'] }]
});

export default {
  id: 'support',
  name: 'Support/Ticketing System',
  version: '2.0.0',
  description: 'Enterprise support ticketing with SLA management, knowledge base, and customer satisfaction',
  dependencies: { features: ['auth', 'notification'], apps: [] },
  configSchema: {
    type: 'object',
    properties: {
      ticketPrefix: { type: 'string', default: 'TKT' },
      autoAssign: { type: 'boolean', default: true },
      defaultPriority: { type: 'string', default: 'medium' },
      enableSatisfaction: { type: 'boolean', default: true }
    }
  },
  collections: ['tickets', 'ticketMessages', 'knowledgeBaseArticles', 'slaPolicies'],
  services: ['ticketService', 'slaService', 'knowledgeBaseService'],
  stores: ['support'],
  hooks: ['onTicketCreated', 'onTicketAssigned', 'onTicketResolved', 'onSlaBreached']
};