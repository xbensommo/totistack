
/**
 * CRM Activities Collection Definition
 * @module apps/crm/collections/crm_activities
 * @description Comprehensive activity tracking for all CRM interactions
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'crm_activities',
  description: 'Complete activity timeline for leads, contacts, and opportunities',
  
  schema: {
    id: { type: 'string', required: true },
    
    // Related entities (polymorphic)
    leadId: { type: 'string', references: 'crm_leads' },
    contactId: { type: 'string', references: 'crm_contacts' },
    accountId: { type: 'string', references: 'crm_accounts' },
    opportunityId: { type: 'string', references: 'crm_opportunities' },
    
    // Activity details
    type: {
      type: 'string',
      required: true,
      enum: [
        'call', 'email', 'meeting', 'task', 'note', 'quote', 
        'order', 'lead_assign', 'stage_change', 'view', 'edit'
      ]
    },
    subtype: { type: 'string' },
    subject: { type: 'string', required: true },
    description: { type: 'string' },
    
    // Duration (for calls/meetings)
    duration: { type: 'number', description: 'Duration in minutes' },
    
    // Outcome
    outcome: {
      type: 'string',
      enum: ['completed', 'no_answer', 'left_message', 'scheduled', 'cancelled', 'pending']
    },
    
    // Communication details
    communication: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['inbound', 'outbound'] },
        from: { type: 'string' },
        to: { type: 'string' },
        cc: { type: 'array' },
        bcc: { type: 'array' }
      }
    },
    
    // File attachments
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          size: { type: 'number' },
          type: { type: 'string' }
        }
      }
    },
    
    // Scheduling
    scheduledAt: { type: 'date' },
    completedAt: { type: 'date' },
    
    // Assignment
    assignedTo: { type: 'string', references: 'users' },
    createdBy: { type: 'string', references: 'users' },
    
    // Visibility
    isPrivate: { type: 'boolean', default: false },
    
    // Timestamps
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true }
  },
  
  indexes: [
    { fields: ['leadId', 'createdAt'] },
    { fields: ['contactId', 'createdAt'] },
    { fields: ['opportunityId', 'createdAt'] },
    { fields: ['accountId', 'createdAt'] },
    { fields: ['assignedTo', 'scheduledAt'] },
    { fields: ['type', 'createdAt'] }
  ],
  
  hooks: {
    afterCreate: ['updateParentLastActivity', 'sendNotifications', 'updateLeadScore']
  }
};