/**
 * CRM Opportunities Collection Definition
 * @module apps/crm/collections/crm_opportunities
 * @description Sales opportunities with pipeline stages and forecasting
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'crm_opportunities',
  description: 'Sales opportunities with pipeline stages and forecasting',
  
  schema: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    opportunityNumber: { type: 'string', required: true, unique: true },
    
    // Related entities
    leadId: { type: 'string', references: 'crm_leads' },
    contactId: { type: 'string', required: true, references: 'crm_contacts' },
    accountId: { type: 'string', references: 'crm_accounts' },
    
    // Deal details
    amount: { type: 'number', required: true, min: 0 },
    currency: { type: 'string', default: 'USD' },
    probability: { type: 'number', min: 0, max: 100, default: 10 },
    expectedCloseDate: { type: 'date', required: true },
    actualCloseDate: { type: 'date' },
    
    // Pipeline
    stage: {
      type: 'string',
      required: true,
      enum: ['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    },
    stageHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage: { type: 'string' },
          enteredAt: { type: 'date' },
          exitedAt: { type: 'date' },
          duration: { type: 'number' }
        }
      }
    },
    
    // Forecast
    forecastCategory: {
      type: 'string',
      enum: ['commit', 'best_case', 'pipeline', 'omitted'],
      description: 'Sales forecast category'
    },
    weightedAmount: { type: 'number', description: 'Amount * probability' },
    
    // Products/Services
    lineItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          quantity: { type: 'number' },
          unitPrice: { type: 'number' },
          total: { type: 'number' }
        }
      }
    },
    
    // Competitors
    competitors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          strengths: { type: 'string' },
          weaknesses: { type: 'string' },
          status: { type: 'string', enum: ['leading', 'competitive', 'losing'] }
        }
      }
    },
    
    // Decision criteria
    decisionCriteria: { type: 'string' },
    nextSteps: { type: 'string' },
    winLossReason: { type: 'string' },
    
    // Assignment
    owner: { type: 'string', required: true, references: 'users' },
    team: { type: 'string', references: 'crm_teams' },
    
    // Tracking
    lastActivityAt: { type: 'date' },
    lastContactAt: { type: 'date' },
    
    // Timestamps
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true },
    closedAt: { type: 'date' }
  },
  
  indexes: [
    { fields: ['opportunityNumber'], unique: true },
    { fields: ['accountId'] },
    { fields: ['owner', 'stage'] },
    { fields: ['expectedCloseDate'] },
    { fields: ['stage', 'probability'] }
  ],
  
  hooks: {
    beforeCreate: ['generateOpportunityNumber', 'calculateWeightedAmount'],
    afterCreate: ['addToPipeline', 'createDealRecord', 'notifyOwner'],
    beforeUpdate: ['trackStageChange', 'updateForecast'],
    afterUpdate: ['triggerWorkflow', 'updateAnalytics']
  }
};