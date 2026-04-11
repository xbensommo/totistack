/**
 * Clients Collection Definition (Normalized Schema)
 * @module apps/client-records/collections/clients
 * @description Normalized client master record with relational references
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'clients',
  description: 'Master client records with normalized relational structure',
  
  schema: {
    id: { type: 'string', required: true, description: 'Client unique identifier' },
    clientNumber: { type: 'string', required: true, unique: true, description: 'Human-readable client number' },
    
    // Primary identification
    type: {
      type: 'string',
      required: true,
      enum: ['individual', 'business', 'nonprofit', 'government'],
      default: 'individual',
      description: 'Client type'
    },
    
    // Business/Organization fields
    companyName: { type: 'string', description: 'Company/organization name' },
    taxId: { type: 'string', description: 'Tax ID / EIN' },
    industry: { type: 'string', description: 'Industry classification' },
    size: { type: 'string', enum: ['1-10', '11-50', '51-200', '201-500', '500+'], description: 'Company size' },
    
    // Individual fields (denormalized from primary contact for quick access)
    firstName: { type: 'string', description: 'First name (primary contact)' },
    lastName: { type: 'string', description: 'Last name (primary contact)' },
    email: { type: 'string', format: 'email', description: 'Primary email' },
    phone: { type: 'string', description: 'Primary phone' },
    
    // Status and lifecycle
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'lead', 'prospect', 'churned', 'blocked'],
      default: 'lead',
      description: 'Client status'
    },
    lifecycleStage: {
      type: 'string',
      enum: ['lead', 'opportunity', 'customer', 'advocate', 'churned'],
      default: 'lead',
      description: 'Client lifecycle stage'
    },
    
    // Engagement metrics
    leadSource: { type: 'string', description: 'How client was acquired' },
    leadScore: { type: 'number', min: 0, max: 100, default: 0, description: 'Lead quality score' },
    lifetimeValue: { type: 'number', default: 0, description: 'Total lifetime value' },
    firstContactAt: { type: 'date', description: 'First contact timestamp' },
    convertedAt: { type: 'date', description: 'Conversion to customer timestamp' },
    lastActivityAt: { type: 'date', description: 'Last activity timestamp' },
    
    // Relationships (normalized references)
    primaryContactId: { type: 'string', references: 'clientContacts', description: 'Primary contact reference' },
    defaultAddressId: { type: 'string', references: 'clientAddresses', description: 'Default address reference' },
    assignedTo: { type: 'string', references: 'users', description: 'Assigned account manager' },
    
    // Segmentation
    segmentIds: { type: 'array', items: { type: 'string' }, references: 'clientSegments', description: 'Segment references' },
    tags: { type: 'array', items: { type: 'string' }, description: 'Client tags' },
    
    // Preferences
    communicationPreferences: {
      type: 'object',
      properties: {
        email: { type: 'boolean', default: true },
        sms: { type: 'boolean', default: false },
        push: { type: 'boolean', default: false },
        marketing: { type: 'boolean', default: true },
        language: { type: 'string', default: 'en' }
      },
      description: 'Communication preferences'
    },
    
    // Custom fields (flexible schema)
    customFields: {
      type: 'object',
      additionalProperties: true,
      description: 'Custom client fields'
    },
    
    // Metadata
    metadata: {
      type: 'object',
      properties: {
        createdBy: { type: 'string' },
        updatedBy: { type: 'string' },
        version: { type: 'number', default: 1 }
      },
      description: 'System metadata'
    },
    
    // Timestamps
    createdAt: { type: 'date', required: true, description: 'Creation timestamp' },
    updatedAt: { type: 'date', required: true, description: 'Last update timestamp' },
    deletedAt: { type: 'date', description: 'Soft delete timestamp' }
  },
  
  indexes: [
    { fields: ['clientNumber'], unique: true },
    { fields: ['email'], unique: true },
    { fields: ['type', 'status'] },
    { fields: ['assignedTo', 'status'] },
    { fields: ['lifecycleStage'] },
    { fields: ['leadScore'], order: 'desc' },
    { fields: ['lastActivityAt'], order: 'desc' }
  ],
  
  hooks: {
    beforeCreate: ['generateClientNumber', 'setDefaultValues', 'validateUniqueEmail'],
    afterCreate: ['createActivityLog', 'initializeSegments'],
    beforeUpdate: ['updateVersion', 'trackChanges'],
    afterUpdate: ['updateSearchIndex', 'notifyAssignees']
  },
  
  security: {
    read: { roles: ['admin', 'manager', 'agent'], owners: ['assignedTo'] },
    write: { roles: ['admin', 'manager'] },
    delete: { roles: ['admin'] }
  }
};