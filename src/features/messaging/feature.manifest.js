/**
 * Messaging System Feature Manifest
 * @module features/messaging
 * @description Enterprise-grade real-time messaging system with presence, typing indicators, and file sharing
 * @author Microsoft Engineering Team
 * @date 2026-03-22
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export const conversationsCollection = defineCollection({
  name: 'conversations',
  shard: { type: 'monthly', field: 'lastActivityAt' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    type: { type: FIELD_TYPES.STRING, required: true, enum: ['direct', 'group', 'channel'], filterable: true },
    participants: { type: FIELD_TYPES.ARRAY, required: true, filterable: true },
    participantDetails: { type: FIELD_TYPES.MAP },
    name: { type: FIELD_TYPES.STRING, searchable: true },
    avatar: { type: FIELD_TYPES.STRING },
    lastMessage: { type: FIELD_TYPES.STRING },
    lastMessageAt: { type: FIELD_TYPES.TIMESTAMP, sortable: true },
    lastMessageBy: { type: FIELD_TYPES.STRING },
    unreadCounts: { type: FIELD_TYPES.MAP },
    pinned: { type: FIELD_TYPES.BOOLEAN, default: false },
    archived: { type: FIELD_TYPES.BOOLEAN, default: false },
    muted: { type: FIELD_TYPES.ARRAY },
    settings: { type: FIELD_TYPES.MAP },
    metadata: { type: FIELD_TYPES.MAP },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['name', 'avatar', 'settings', 'metadata', 'pinned', 'archived', 'muted'],
  updateableFields: ['lastMessage', 'lastMessageAt', 'lastMessageBy', 'unreadCounts'],
  indexes: [
    { fields: ['participants'] },
    { fields: ['type', 'lastActivityAt'] },
    { fields: ['pinned', 'lastActivityAt'] }
  ],
  search: { mode: 'token-array', fields: ['name', 'participantDetails.*.name'] }
});

export const messagesCollection = defineCollection({
  name: 'messages',
  shard: { type: 'monthly', field: 'createdAt' },
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    conversationId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    type: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'reaction', 'system'],
      default: 'text'
    },
    content: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    media: { type: FIELD_TYPES.ARRAY },
    attachments: { type: FIELD_TYPES.ARRAY },
    replyTo: { type: FIELD_TYPES.STRING },
    reactions: { type: FIELD_TYPES.MAP },
    mentions: { type: FIELD_TYPES.ARRAY },
    status: {
      type: FIELD_TYPES.STRING,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sending'
    },
    deliveredAt: { type: FIELD_TYPES.TIMESTAMP },
    readAt: { type: FIELD_TYPES.TIMESTAMP },
    editedAt: { type: FIELD_TYPES.TIMESTAMP },
    deletedAt: { type: FIELD_TYPES.TIMESTAMP },
    metadata: { type: FIELD_TYPES.MAP },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true }
  },
  writableFields: ['conversationId', 'userId', 'type', 'content', 'media', 'attachments', 'replyTo', 'mentions', 'metadata'],
  updateableFields: ['status', 'deliveredAt', 'readAt', 'editedAt', 'deletedAt', 'reactions'],
  indexes: [
    { fields: ['conversationId', 'createdAt'] },
    { fields: ['userId', 'createdAt'] },
    { fields: ['status'] }
  ],
  search: { mode: 'token-array', fields: ['content'] }
});

export const userPresenceCollection = defineCollection({
  name: 'userPresence',
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    userId: { type: FIELD_TYPES.STRING, required: true, unique: true, filterable: true },
    status: { type: FIELD_TYPES.STRING, enum: ['online', 'away', 'busy', 'offline'], default: 'offline' },
    lastSeen: { type: FIELD_TYPES.TIMESTAMP, required: true },
    deviceInfo: { type: FIELD_TYPES.MAP },
    typingIn: { type: FIELD_TYPES.ARRAY },
    activeConversation: { type: FIELD_TYPES.STRING },
    metadata: { type: FIELD_TYPES.MAP },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['status', 'deviceInfo', 'typingIn', 'activeConversation', 'metadata'],
  indexes: [{ fields: ['userId'] }, { fields: ['status', 'lastSeen'] }]
});

export const messageTemplatesCollection = defineCollection({
  name: 'messageTemplates',
  schema: {
    id: { type: FIELD_TYPES.STRING, required: true },
    name: { type: FIELD_TYPES.STRING, required: true, unique: true },
    category: { type: FIELD_TYPES.STRING, enum: ['greeting', 'farewell', 'support', 'sales', 'custom'] },
    content: { type: FIELD_TYPES.STRING, required: true },
    variables: { type: FIELD_TYPES.ARRAY },
    isActive: { type: FIELD_TYPES.BOOLEAN, default: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP }
  },
  writableFields: ['name', 'category', 'content', 'variables', 'isActive'],
  indexes: [{ fields: ['name'], unique: true }, { fields: ['category', 'isActive'] }],
  search: { mode: 'token-array', fields: ['name', 'content'] }
});

export default {
  id: 'messaging',
  name: 'Messaging System',
  version: '2.0.0',
  description: 'Enterprise real-time messaging with presence, typing indicators, and file sharing',
  dependencies: { features: ['auth', 'media', 'notification'], apps: [] },
  configSchema: {
    type: 'object',
    properties: {
      maxMessageLength: { type: 'number', default: 4096 },
      allowedFileTypes: { type: 'array', default: ['image', 'video', 'audio', 'pdf', 'doc', 'xls'] },
      maxFileSize: { type: 'number', default: 10485760 },
      presenceTimeout: { type: 'number', default: 60000 },
      typingTimeout: { type: 'number', default: 3000 }
    }
  },
  collections: ['conversations', 'messages', 'userPresence', 'messageTemplates'],
  services: ['messagingService', 'presenceService', 'realtimeService'],
  stores: ['messaging'],
  hooks: ['onMessageSent', 'onMessageRead', 'onPresenceChanged', 'onTypingStarted']
};