
/**
 * CRM Leads Collection Definition
 * @module apps/crm/collections/crm_leads
 * @description Lead management with scoring, qualification, and conversion
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'crm_leads',
  description: 'Sales leads with scoring and qualification workflow',
  
  schema: {
    id: { type: 'string', required: true },
    leadNumber: { type: 'string', required: true, unique: true },
    
    // Lead information
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    company: { type: 'string' },
    title: { type: 'string' },
    website: { type: 'string', format: 'url' },
    
    // Lead source and qualification
    source: {
      type: 'string',
      enum: ['website', 'referral', 'social', 'email', 'event', 'cold_call', 'ad', 'other'],
      description: 'Lead acquisition source'
    },
    status: {
      type: 'string',
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
      default: 'new'
    },
    qualification: {
      type: 'object',
      properties: {
        budget: { type: 'string', enum: ['unknown', '<1k', '1k-5k', '5k-10k', '10k-50k', '50k+'] },
        authority: { type: 'string', enum: ['unknown', 'user', 'manager', 'director', 'executive', 'c-level'] },
        need: { type: 'string', enum: ['unknown', 'exploring', 'evaluating', 'ready', 'urgent'] },
        timeline: { type: 'string', enum: ['unknown', '1-3 months', '3-6 months', '6-12 months', '12+ months'] }
      }
    },
    
    // Lead scoring
    score: {
      type: 'object',
      properties: {
        total: { type: 'number', min: 0, max: 100, default: 0 },
        fit: { type: 'number', min: 0, max: 100 },
        engagement: { type: 'number', min: 0, max: 100 },
        behavior: { type: 'number', min: 0, max: 100 }
      }
    },
    
    // Conversion
    convertedTo: {
      type: 'object',
      properties: {
        contactId: { type: 'string', references: 'crm_contacts' },
        accountId: { type: 'string', references: 'crm_accounts' },
        opportunityId: { type: 'string', references: 'crm_opportunities' },
        convertedAt: { type: 'date' }
      }
    },
    
    // Assignment
    assignedTo: { type: 'string', references: 'users' },
    assignedTeam: { type: 'string', references: 'crm_teams' },
    
    // Tags and notes
    tags: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'object' } },
    
    // Activity tracking
    lastActivityAt: { type: 'date' },
    nextFollowUp: { type: 'date' },
    
    // Timestamps
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true },
    createdBy: { type: 'string', references: 'users' }
  },
  
  indexes: [
    { fields: ['leadNumber'], unique: true },
    { fields: ['email'] },
    { fields: ['status', 'score.total'] },
    { fields: ['assignedTo', 'status'] },
    { fields: ['source'] },
    { fields: ['nextFollowUp'] }
  ],
  
  hooks: {
    beforeCreate: ['generateLeadNumber', 'calculateInitialScore'],
    afterCreate: ['assignToSalesRep', 'createWelcomeActivity', 'triggerWorkflow'],
    beforeUpdate: ['recalculateScore', 'handleStatusChange'],
    afterUpdate: ['notifyAssignee', 'updateAnalytics']
  }
};