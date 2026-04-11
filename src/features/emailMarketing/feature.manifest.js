/**
 * Email Marketing Feature Manifest
 * @module features/emailMarketing
 * @description Enterprise email marketing with campaigns, automation, and analytics
 * @author Microsoft Engineering Team
 * @date 2026-03-22
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export const emailCampaignsCollection = defineCollection({
  name: 'emailCampaigns',
  shard: { type: 'monthly', field: 'createdAt' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    subject: { type: FIELD_TYPES.STRING, required: true },
    fromName: { type: FIELD_TYPES.STRING, required: true },
    fromEmail: { type: FIELD_TYPES.STRING, required: true },
    replyTo: { type: FIELD_TYPES.STRING },
    content: { type: FIELD_TYPES.STRING, required: true },
    htmlContent: { type: FIELD_TYPES.STRING },
    templateId: { type: FIELD_TYPES.STRING },
    status: {
      type: FIELD_TYPES.STRING,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed'],
      default: 'draft'
    },
    type: { type: FIELD_TYPES.STRING, enum: ['regular', 'automated', 'ab_test'], default: 'regular' },
    segments: { type: FIELD_TYPES.ARRAY },
    excludeSegments: { type: FIELD_TYPES.ARRAY },
    scheduleAt: { type: FIELD_TYPES.TIMESTAMP },
    sentAt: { type: FIELD_TYPES.TIMESTAMP },
    stats: {
      type: FIELD_TYPES.MAP,
      properties: {
        sent: { type: FIELD_TYPES.NUMBER, default: 0 },
        delivered: { type: FIELD_TYPES.NUMBER, default: 0 },
        opened: { type: FIELD_TYPES.NUMBER, default: 0 },
        clicked: { type: FIELD_TYPES.NUMBER, default: 0 },
        bounced: { type: FIELD_TYPES.NUMBER, default: 0 },
        unsubscribed: { type: FIELD_TYPES.NUMBER, default: 0 },
        complained: { type: FIELD_TYPES.NUMBER, default: 0 }
      }
    },
    abTest: {
      type: FIELD_TYPES.MAP,
      properties: {
        variants: { type: FIELD_TYPES.ARRAY },
        winnerCriteria: { type: FIELD_TYPES.STRING },
        winnerSelected: { type: FIELD_TYPES.STRING },
        sendWinnerToRemaining: { type: FIELD_TYPES.BOOLEAN }
      }
    },
    metadata: { type: FIELD_TYPES.MAP },
    createdBy: { type: FIELD_TYPES.STRING },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['name', 'subject', 'fromName', 'fromEmail', 'replyTo', 'content', 'htmlContent', 'templateId', 'type', 'segments', 'excludeSegments', 'scheduleAt', 'abTest', 'metadata'],
  updateableFields: ['status', 'stats', 'sentAt'],
  indexes: [
    { fields: ['status', 'scheduleAt'] },
    { fields: ['createdBy', 'createdAt'] },
    { fields: ['type', 'status'] }
  ],
  search: { mode: 'token-array', fields: ['name', 'subject'] }
});

export const emailSubscribersCollection = defineCollection({
  name: 'emailSubscribers',
  shard: { type: 'monthly', field: 'createdAt' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    email: { type: FIELD_TYPES.STRING, required: true, unique: true, filterable: true },
    firstName: { type: FIELD_TYPES.STRING, searchable: true },
    lastName: { type: FIELD_TYPES.STRING, searchable: true },
    segments: { type: FIELD_TYPES.ARRAY, filterable: true },
    tags: { type: FIELD_TYPES.ARRAY, filterable: true },
    status: {
      type: FIELD_TYPES.STRING,
      enum: ['active', 'unsubscribed', 'bounced', 'complained'],
      default: 'active'
    },
    subscribedAt: { type: FIELD_TYPES.TIMESTAMP, required: true },
    unsubscribedAt: { type: FIELD_TYPES.TIMESTAMP },
    source: { type: FIELD_TYPES.STRING },
    metadata: { type: FIELD_TYPES.MAP },
    customFields: { type: FIELD_TYPES.MAP },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['firstName', 'lastName', 'segments', 'tags', 'metadata', 'customFields'],
  updateableFields: ['status', 'unsubscribedAt'],
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['status', 'createdAt'] },
    { fields: ['segments'] },
    { fields: ['tags'] }
  ],
  search: { mode: 'token-array', fields: ['email', 'firstName', 'lastName'] }
});

export const emailTemplatesCollection = defineCollection({
  name: 'emailTemplates',
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    name: { type: FIELD_TYPES.STRING, required: true, unique: true },
    subject: { type: FIELD_TYPES.STRING, required: true },
    content: { type: FIELD_TYPES.STRING, required: true },
    htmlContent: { type: FIELD_TYPES.STRING },
    variables: { type: FIELD_TYPES.ARRAY },
    category: { type: FIELD_TYPES.STRING },
    thumbnail: { type: FIELD_TYPES.STRING },
    isActive: { type: FIELD_TYPES.BOOLEAN, default: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['name', 'subject', 'content', 'htmlContent', 'variables', 'category', 'thumbnail', 'isActive'],
  indexes: [{ fields: ['name'], unique: true }, { fields: ['category', 'isActive'] }],
  search: { mode: 'token-array', fields: ['name', 'subject'] }
});

export const emailAnalyticsCollection = defineCollection({
  name: 'emailAnalytics',
  shard: { type: 'monthly', field: 'timestamp' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    campaignId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    subscriberId: { type: FIELD_TYPES.STRING, filterable: true },
    email: { type: FIELD_TYPES.STRING, filterable: true },
    eventType: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained']
    },
    timestamp: { type: FIELD_TYPES.TIMESTAMP, required: true },
    metadata: { type: FIELD_TYPES.MAP },
    linkUrl: { type: FIELD_TYPES.STRING },
    userAgent: { type: FIELD_TYPES.STRING },
    ipAddress: { type: FIELD_TYPES.STRING }
  },
  writableFields: ['campaignId', 'subscriberId', 'email', 'eventType', 'metadata', 'linkUrl', 'userAgent', 'ipAddress'],
  indexes: [
    { fields: ['campaignId', 'eventType', 'timestamp'] },
    { fields: ['subscriberId', 'eventType'] },
    { fields: ['email', 'timestamp'] }
  ]
});

export default {
  id: 'emailMarketing',
  name: 'Email Marketing',
  version: '2.0.0',
  description: 'Enterprise email marketing with campaigns, automation, and analytics',
  dependencies: { features: ['auth', 'integration', 'notification'], apps: [] },
  configSchema: {
    type: 'object',
    properties: {
      defaultFromEmail: { type: 'string', default: 'noreply@example.com' },
      defaultFromName: { type: 'string', default: 'System' },
      sendLimit: { type: 'number', default: 1000 },
      trackingEnabled: { type: 'boolean', default: true },
      openTracking: { type: 'boolean', default: true },
      clickTracking: { type: 'boolean', default: true }
    }
  },
  collections: ['emailCampaigns', 'emailSubscribers', 'emailTemplates', 'emailAnalytics'],
  services: ['emailMarketingService', 'campaignService', 'subscriberService'],
  stores: ['emailMarketing'],
  hooks: ['onCampaignSent', 'onSubscriberAdded', 'onEmailOpened', 'onLinkClicked']
};