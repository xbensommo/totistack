/**
 * Client Contacts Collection Definition (Normalized)
 * @module apps/client-records/collections/clientContacts
 * @description Normalized client contacts with multiple contacts per client
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'clientContacts',
  description: 'Multiple contacts per client with roles and permissions',
  
  schema: {
    id: { type: 'string', required: true },
    clientId: { type: 'string', required: true, references: 'clients', description: 'Parent client' },
    
    // Contact information
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    title: { type: 'string', description: 'Job title' },
    department: { type: 'string', description: 'Department' },
    
    // Contact methods
    email: { type: 'string', format: 'email', required: true },
    phone: { type: 'string' },
    mobile: { type: 'string' },
    fax: { type: 'string' },
    
    // Role and permissions
    role: {
      type: 'string',
      enum: ['primary', 'billing', 'technical', 'executive', 'other'],
      default: 'other',
      description: 'Contact role'
    },
    isPrimary: { type: 'boolean', default: false, description: 'Primary contact flag' },
    receivesNotifications: { type: 'boolean', default: true },
    
    // Communication preferences
    preferences: {
      type: 'object',
      properties: {
        email: { type: 'boolean', default: true },
        sms: { type: 'boolean', default: false },
        phone: { type: 'boolean', default: true }
      }
    },
    
    // Metadata
    notes: { type: 'string' },
    
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true }
  },
  
  indexes: [
    { fields: ['clientId'] },
    { fields: ['email'] },
    { fields: ['clientId', 'isPrimary'] },
    { fields: ['role'] }
  ]
};