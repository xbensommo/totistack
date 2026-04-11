/**
 * Client Activities Collection Definition (Normalized)
 * @module apps/client-records/collections/clientActivities
 * @description Activity timeline for client interactions
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'clientActivities',
  description: 'Activity timeline for client interactions and engagement',
  
  schema: {
    id: { type: 'string', required: true },
    clientId: { type: 'string', required: true, references: 'clients' },
    userId: { type: 'string', required: true, references: 'users', description: 'User who performed activity' },
    
    // Activity details
    type: {
      type: 'string',
      required: true,
      enum: [
        'call', 'email', 'meeting', 'note', 'task', 'order', 'booking',
        'view', 'edit', 'status_change', 'payment', 'support_ticket'
      ],
      description: 'Activity type'
    },
    
    action: { type: 'string', required: true, description: 'Specific action taken' },
    description: { type: 'string', description: 'Human-readable description' },
    
    // Associated data (polymorphic references)
    referenceType: { type: 'string', description: 'Type of referenced entity' },
    referenceId: { type: 'string', description: 'ID of referenced entity' },
    
    // Activity metadata
    metadata: {
      type: 'object',
      additionalProperties: true,
      description: 'Activity-specific metadata'
    },
    
    // Duration (for calls/meetings)
    duration: { type: 'number', description: 'Duration in minutes' },
    
    // Outcome
    outcome: {
      type: 'string',
      enum: ['completed', 'missed', 'scheduled', 'rescheduled', 'cancelled'],
      description: 'Activity outcome'
    },
    
    // Importance
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    
    // Visibility
    isPublic: { type: 'boolean', default: true, description: 'Visible to client' },
    
    createdAt: { type: 'date', required: true }
  },
  
  indexes: [
    { fields: ['clientId', 'createdAt'], order: 'desc' },
    { fields: ['type', 'createdAt'] },
    { fields: ['userId', 'createdAt'] },
    { fields: ['referenceType', 'referenceId'] }
  ],
  
  hooks: {
    afterCreate: ['updateClientLastActivity', 'triggerNotifications']
  }
};