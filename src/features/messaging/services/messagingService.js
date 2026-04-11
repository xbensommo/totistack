/**
 * Messaging Service
 * @module features/messaging/services/messagingService
 * @description Core messaging service with real-time capabilities
 * @author Microsoft Engineering Team
 * @date 2026-03-22
 */

import { Timestamp } from 'firebase/firestore';
import { getFriendlyMessage } from '@xbensommo/shard-provider';

export class MessagingService {
  /** @type {Object} Shard provider */
  #provider = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Media service */
  #mediaService = null;
  
  /** @type {Object} Notification service */
  #notificationService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Message cache */
  #messageCache = new Map();
  
  /** @type {Map} Conversation cache */
  #conversationCache = new Map();
  
  /** @type {WebSocket} Realtime connection */
  #wsConnection = null;
  
  /** @type {Array} Event listeners */
  #listeners = new Map();
  
  /**
   * Get singleton instance
   * @returns {MessagingService}
   */
  static getInstance() {
    if (!globalThis.__messagingService) {
      globalThis.__messagingService = new MessagingService();
    }
    return globalThis.__messagingService;
  }
  
  /**
   * Initialize messaging service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @param {Object} mediaService - Media service
   * @param {Object} notificationService - Notification service
   * @param {Object} provider - Shard provider
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService, mediaService, notificationService, provider) {
    if (this.#initialized) return;
    
    try {
      this.#provider = provider;
      this.#authService = authService;
      this.#mediaService = mediaService;
      this.#notificationService = notificationService;
      this.#config = {
        maxMessageLength: 4096,
        allowedFileTypes: ['image', 'video', 'audio', 'pdf', 'doc', 'xls'],
        maxFileSize: 10485760,
        presenceTimeout: 60000,
        typingTimeout: 3000,
        ...config
      };
      
      // Initialize presence heartbeat
      this.#startPresenceHeartbeat();
      
      this.#initialized = true;
      console.info('[MessagingService] Initialized');
      
    } catch (error) {
      console.error('[MessagingService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create conversation
   * @param {Object} params - Conversation parameters
   * @returns {Promise<Object>} Created conversation
   */
  async createConversation(params) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const now = Timestamp.now();
      const participants = [user.uid, ...(params.participants || [])];
      const uniqueParticipants = [...new Set(participants)];
      
      // Check if direct conversation exists
      if (params.type === 'direct' && uniqueParticipants.length === 2) {
        const existing = await this.#findDirectConversation(user.uid, uniqueParticipants[1]);
        if (existing) return existing;
      }
      
      const conversation = {
        id: this.#generateId('conv'),
        type: params.type || (uniqueParticipants.length === 2 ? 'direct' : 'group'),
        participants: uniqueParticipants,
        participantDetails: await this.#getParticipantDetails(uniqueParticipants),
        name: params.name || this.#generateConversationName(uniqueParticipants, user),
        avatar: params.avatar,
        lastMessage: null,
        lastMessageAt: now,
        unreadCounts: Object.fromEntries(uniqueParticipants.map(p => [p, 0])),
        pinned: false,
        archived: false,
        muted: [],
        settings: params.settings || {},
        metadata: params.metadata || {},
        createdAt: now,
        updatedAt: now
      };
      
      const result = await this.#provider.create('conversations', conversation);
      
      // Create system message
      await this.sendMessage({
        conversationId: result.id,
        type: 'system',
        content: `${user.displayName || user.email} created this conversation`,
        metadata: { action: 'create' }
      });
      
      console.info(`[MessagingService] Conversation created: ${result.id}`);
      
      return { ...conversation, id: result.id };
      
    } catch (error) {
      console.error('[MessagingService] Create conversation failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Send message
   * @param {Object} params - Message parameters
   * @returns {Promise<Object>} Sent message
   */
  async sendMessage(params) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const conversation = await this.getConversation(params.conversationId);
      if (!conversation) throw new Error('CONVERSATION_NOT_FOUND');
      
      if (!conversation.participants.includes(user.uid)) {
        throw new Error('NOT_PARTICIPANT');
      }
      
      // Validate message
      if (params.type === 'text' && params.content.length > this.#config.maxMessageLength) {
        throw new Error('MESSAGE_TOO_LONG');
      }
      
      const now = Timestamp.now();
      const message = {
        id: this.#generateId('msg'),
        conversationId: params.conversationId,
        userId: user.uid,
        type: params.type || 'text',
        content: params.content,
        media: params.media || [],
        attachments: params.attachments || [],
        replyTo: params.replyTo,
        reactions: {},
        mentions: params.mentions || [],
        status: 'sending',
        metadata: params.metadata || {},
        createdAt: now
      };
      
      // Upload media if present
      if (params.files && params.files.length > 0) {
        const uploadedMedia = [];
        for (const file of params.files) {
          const uploaded = await this.#mediaService.upload(file, {
            folder: `messages/${params.conversationId}`,
            metadata: { userId: user.uid, messageId: message.id }
          });
          uploadedMedia.push(uploaded);
        }
        message.attachments = uploadedMedia;
      }
      
      const result = await this.#provider.create('messages', message);
      
      // Update conversation
      const unreadCounts = { ...conversation.unreadCounts };
      for (const participant of conversation.participants) {
        if (participant !== user.uid) {
          unreadCounts[participant] = (unreadCounts[participant] || 0) + 1;
        }
      }
      
      await this.#provider.update('conversations', params.conversationId, {
        lastMessage: params.type === 'text' ? params.content : `[${params.type}]`,
        lastMessageAt: now,
        lastMessageBy: user.uid,
        unreadCounts,
        updatedAt: now
      });
      
      // Update status to sent
      await this.#provider.update('messages', result.id, {
        status: 'sent',
        deliveredAt: now
      });
      
      // Send notifications to other participants
      await this.#sendMessageNotifications(conversation, message, user);
      
      // Emit real-time event
      this.#emit('message:sent', { conversationId: params.conversationId, message: { ...message, id: result.id } });
      
      console.info(`[MessagingService] Message sent: ${result.id}`);
      
      return { ...message, id: result.id };
      
    } catch (error) {
      console.error('[MessagingService] Send message failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Last read message ID
   * @returns {Promise<void>}
   */
  async markAsRead(conversationId, messageId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const conversation = await this.getConversation(conversationId);
      if (!conversation) throw new Error('CONVERSATION_NOT_FOUND');
      
      // Get unread messages
      const messages = await this.#provider.query('messages', {
        filters: [
          { field: 'conversationId', operator: '==', value: conversationId },
          { field: 'userId', operator: '!=', value: user.uid },
          { field: 'readAt', operator: '==', value: null }
        ],
        limit: 100
      });
      
      const now = Timestamp.now();
      const batch = [];
      
      for (const msg of messages.items) {
        batch.push(this.#provider.update('messages', msg.id, {
          status: 'read',
          readAt: now,
          updatedAt: now
        }));
      }
      
      await Promise.all(batch);
      
      // Reset unread count
      const unreadCounts = { ...conversation.unreadCounts };
      unreadCounts[user.uid] = 0;
      
      await this.#provider.update('conversations', conversationId, {
        unreadCounts,
        updatedAt: now
      });
      
      this.#emit('messages:read', { conversationId, userId: user.uid, messageId });
      
    } catch (error) {
      console.error('[MessagingService] Mark as read failed:', error);
      throw error;
    }
  }
  
  /**
   * Set typing indicator
   * @param {string} conversationId - Conversation ID
   * @param {boolean} isTyping - Whether user is typing
   * @returns {Promise<void>}
   */
  async setTyping(conversationId, isTyping) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const presence = await this.getUserPresence(user.uid);
      const typingIn = presence?.typingIn || [];
      
      if (isTyping && !typingIn.includes(conversationId)) {
        typingIn.push(conversationId);
      } else if (!isTyping) {
        const index = typingIn.indexOf(conversationId);
        if (index > -1) typingIn.splice(index, 1);
      }
      
      await this.#updatePresence(user.uid, { typingIn });
      
      this.#emit('typing', { conversationId, userId: user.uid, isTyping });
      
    } catch (error) {
      console.error('[MessagingService] Set typing failed:', error);
    }
  }
  
  /**
   * Get conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object|null>} Conversation
   */
  async getConversation(conversationId) {
    try {
      if (this.#conversationCache.has(conversationId)) {
        return this.#conversationCache.get(conversationId);
      }
      
      const result = await this.#provider.query('conversations', {
        filters: [{ field: 'id', operator: '==', value: conversationId }],
        limit: 1
      });
      
      const conversation = result.items[0];
      if (conversation) {
        this.#conversationCache.set(conversationId, conversation);
      }
      
      return conversation || null;
      
    } catch (error) {
      console.error('[MessagingService] Get conversation failed:', error);
      return null;
    }
  }
  
  /**
   * Get user conversations
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Conversations list
   */
  async getUserConversations(userId, options = {}) {
    try {
      const { archived = false, limit = 50, startAfter = null } = options;
      
      const filters = [
        { field: 'participants', operator: 'array-contains', value: userId }
      ];
      
      if (!archived) {
        filters.push({ field: 'archived', operator: '==', value: false });
      }
      
      const result = await this.#provider.query('conversations', {
        filters,
        orderBy: [{ field: 'lastMessageAt', direction: 'desc' }],
        limit,
        startAfter
      });
      
      // Add unread count and participant details
      const conversations = result.items.map(conv => ({
        ...conv,
        unreadCount: conv.unreadCounts?.[userId] || 0
      }));
      
      return { items: conversations, pagination: result.pagination };
      
    } catch (error) {
      console.error('[MessagingService] Get user conversations failed:', error);
      return { items: [], pagination: {} };
    }
  }
  
  /**
   * Get conversation messages
   * @param {string} conversationId - Conversation ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Messages list
   */
  async getConversationMessages(conversationId, options = {}) {
    try {
      const { limit = 50, startAfter = null, before = null } = options;
      
      let constraints = [
        { field: 'conversationId', operator: '==', value: conversationId }
      ];
      
      let orderBy = [{ field: 'createdAt', direction: 'desc' }];
      
      const result = await this.#provider.query('messages', {
        filters: constraints,
        orderBy,
        limit,
        startAfter
      });
      
      // Reverse to chronological order
      const messages = result.items.reverse();
      
      return { items: messages, pagination: result.pagination };
      
    } catch (error) {
      console.error('[MessagingService] Get conversation messages failed:', error);
      return { items: [], pagination: {} };
    }
  }
  
  /**
   * Update user presence
   * @param {string} userId - User ID
   * @param {string} status - Presence status
   * @returns {Promise<void>}
   */
  async updatePresence(userId, status) {
    try {
      await this.#updatePresence(userId, { status });
      this.#emit('presence', { userId, status });
    } catch (error) {
      console.error('[MessagingService] Update presence failed:', error);
    }
  }
  
  /**
   * Get user presence
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Presence data
   */
  async getUserPresence(userId) {
    try {
      const result = await this.#provider.query('userPresence', {
        filters: [{ field: 'userId', operator: '==', value: userId }],
        limit: 1
      });
      return result.items[0] || null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get user statuses for multiple users
   * @param {Array} userIds - User IDs
   * @returns {Promise<Map>} Status map
   */
  async getUserStatuses(userIds) {
    try {
      const statuses = new Map();
      for (const userId of userIds) {
        const presence = await this.getUserPresence(userId);
        statuses.set(userId, presence?.status || 'offline');
      }
      return statuses;
    } catch (error) {
      return new Map();
    }
  }
  
  /**
   * Pin conversation
   * @param {string} conversationId - Conversation ID
   * @param {boolean} pinned - Whether to pin
   * @returns {Promise<void>}
   */
  async pinConversation(conversationId, pinned = true) {
    try {
      await this.#provider.update('conversations', conversationId, {
        pinned,
        updatedAt: Timestamp.now()
      });
      this.#conversationCache.delete(conversationId);
    } catch (error) {
      console.error('[MessagingService] Pin conversation failed:', error);
      throw error;
    }
  }
  
  /**
   * Archive conversation
   * @param {string} conversationId - Conversation ID
   * @param {boolean} archived - Whether to archive
   * @returns {Promise<void>}
   */
  async archiveConversation(conversationId, archived = true) {
    try {
      await this.#provider.update('conversations', conversationId, {
        archived,
        updatedAt: Timestamp.now()
      });
      this.#conversationCache.delete(conversationId);
    } catch (error) {
      console.error('[MessagingService] Archive conversation failed:', error);
      throw error;
    }
  }
  
  /**
   * Add reaction to message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Reaction emoji
   * @returns {Promise<void>}
   */
  async addReaction(messageId, emoji) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const message = await this.#getMessage(messageId);
      if (!message) throw new Error('MESSAGE_NOT_FOUND');
      
      const reactions = { ...message.reactions };
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      
      if (!reactions[emoji].includes(user.uid)) {
        reactions[emoji].push(user.uid);
      }
      
      await this.#provider.update('messages', messageId, {
        reactions,
        updatedAt: Timestamp.now()
      });
      
      this.#emit('reaction:added', { messageId, userId: user.uid, emoji });
      
    } catch (error) {
      console.error('[MessagingService] Add reaction failed:', error);
      throw error;
    }
  }
  
  /**
   * Remove reaction from message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Reaction emoji
   * @returns {Promise<void>}
   */
  async removeReaction(messageId, emoji) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const message = await this.#getMessage(messageId);
      if (!message) throw new Error('MESSAGE_NOT_FOUND');
      
      const reactions = { ...message.reactions };
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(id => id !== user.uid);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }
      
      await this.#provider.update('messages', messageId, {
        reactions,
        updatedAt: Timestamp.now()
      });
      
      this.#emit('reaction:removed', { messageId, userId: user.uid, emoji });
      
    } catch (error) {
      console.error('[MessagingService] Remove reaction failed:', error);
      throw error;
    }
  }
  
  /**
   * Delete message (soft delete)
   * @param {string} messageId - Message ID
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) throw new Error('AUTH_REQUIRED');
      
      const message = await this.#getMessage(messageId);
      if (!message) throw new Error('MESSAGE_NOT_FOUND');
      
      if (message.userId !== user.uid) {
        throw new Error('NOT_AUTHORIZED');
      }
      
      await this.#provider.update('messages', messageId, {
        deletedAt: Timestamp.now(),
        content: '[Message deleted]',
        updatedAt: Timestamp.now()
      });
      
      this.#emit('message:deleted', { messageId, userId: user.uid });
      
    } catch (error) {
      console.error('[MessagingService] Delete message failed:', error);
      throw error;
    }
  }
  
  /**
   * Create message template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    try {
      const now = Timestamp.now();
      
      const template = {
        id: this.#generateId('tpl'),
        name: templateData.name,
        category: templateData.category || 'custom',
        content: templateData.content,
        variables: templateData.variables || [],
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await this.#provider.create('messageTemplates', template);
      
      console.info(`[MessagingService] Template created: ${template.name}`);
      
      return { ...template, id: result.id };
      
    } catch (error) {
      console.error('[MessagingService] Create template failed:', error);
      throw error;
    }
  }
  
  /**
   * Get message templates
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Templates list
   */
  async getTemplates(options = {}) {
    try {
      const { category = null, isActive = true, limit = 50 } = options;
      
      const filters = [];
      if (category) filters.push({ field: 'category', operator: '==', value: category });
      if (isActive !== null) filters.push({ field: 'isActive', operator: '==', value: isActive });
      
      const result = await this.#provider.query('messageTemplates', {
        filters,
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit
      });
      
      return result.items;
      
    } catch (error) {
      console.error('[MessagingService] Get templates failed:', error);
      return [];
    }
  }
  
  /**
   * Find direct conversation between two users
   * @private
   */
  async #findDirectConversation(userId1, userId2) {
    try {
      const result = await this.#provider.query('conversations', {
        filters: [
          { field: 'type', operator: '==', value: 'direct' },
          { field: 'participants', operator: 'array-contains', value: userId1 }
        ],
        limit: 100
      });
      
      for (const conv of result.items) {
        if (conv.participants.includes(userId2)) {
          return conv;
        }
      }
      
      return null;
      
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get participant details
   * @private
   */
  async #getParticipantDetails(userIds) {
    const details = {};
    for (const userId of userIds) {
      const user = await this.#authService.getUser(userId);
      if (user) {
        details[userId] = {
          name: user.displayName || user.email,
          avatar: user.photoURL,
          email: user.email
        };
      }
    }
    return details;
  }
  
  /**
   * Generate conversation name
   * @private
   */
  #generateConversationName(participants, currentUser) {
    const otherParticipants = participants.filter(p => p !== currentUser.uid);
    const names = otherParticipants.map(p => {
      const details = this.#conversationCache.get(p);
      return details?.participantDetails?.[p]?.name || 'User';
    });
    return names.join(', ');
  }
  
  /**
   * Get message by ID
   * @private
   */
  async #getMessage(messageId) {
    const result = await this.#provider.query('messages', {
      filters: [{ field: 'id', operator: '==', value: messageId }],
      limit: 1
    });
    return result.items[0] || null;
  }
  
  /**
   * Update presence
   * @private
   */
  async #updatePresence(userId, data) {
    const now = Timestamp.now();
    const existing = await this.getUserPresence(userId);
    
    if (existing) {
      await this.#provider.update('userPresence', existing.id, {
        ...data,
        lastSeen: now,
        updatedAt: now
      });
    } else {
      await this.#provider.create('userPresence', {
        id: this.#generateId('pres'),
        userId,
        status: 'online',
        lastSeen: now,
        typingIn: [],
        ...data,
        updatedAt: now
      });
    }
  }
  
  /**
   * Start presence heartbeat
   * @private
   */
  #startPresenceHeartbeat() {
    setInterval(async () => {
      const user = this.#authService.getCurrentUser();
      if (user) {
        await this.#updatePresence(user.uid, {});
      }
    }, 30000);
  }
  
  /**
   * Send message notifications
   * @private
   */
  async #sendMessageNotifications(conversation, message, sender) {
    const otherParticipants = conversation.participants.filter(p => p !== sender.uid);
    
    for (const participantId of otherParticipants) {
      const muted = conversation.muted?.includes(participantId);
      if (muted) continue;
      
      const participant = await this.#authService.getUser(participantId);
      if (!participant) continue;
      
      await this.#notificationService.send({
        userId: participantId,
        type: 'push',
        title: `${sender.displayName || sender.email}`,
        body: message.type === 'text' ? message.content : `Sent a ${message.type}`,
        data: {
          type: 'message',
          conversationId: conversation.id,
          messageId: message.id,
          conversationName: conversation.name
        }
      });
    }
  }
  
  /**
   * Event emitter
   * @private
   */
  #emit(event, data) {
    const listeners = this.#listeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  /**
   * Subscribe to events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push(callback);
    
    return () => {
      const listeners = this.#listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'CONVERSATION_NOT_FOUND': 'Conversation not found',
      'NOT_PARTICIPANT': 'You are not a participant in this conversation',
      'MESSAGE_TOO_LONG': `Message exceeds maximum length of ${this.#config.maxMessageLength} characters`,
      'MESSAGE_NOT_FOUND': 'Message not found',
      'NOT_AUTHORIZED': 'You are not authorized to perform this action'
    };
    
    const message = errorMap[error.message] || getFriendlyMessage(error) || error.message || 'MESSAGING_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const messagingService = MessagingService.getInstance();
export default messagingService;