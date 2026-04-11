
/**
 * Content Types Collection Definition
 * @module features/cms/collections/contentTypes
 * @description Content type definitions for structured content
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'contentTypes',
  description: 'Content type definitions with field schemas',
  
  schema: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true, description: 'Display name' },
    slug: { type: 'string', required: true, unique: true, description: 'URL-friendly identifier' },
    description: { type: 'string', description: 'Content type description' },
    
    // Field definitions
    fields: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          type: {
            type: 'string',
            enum: ['text', 'textarea', 'richtext', 'number', 'boolean', 'date', 'datetime', 
                   'image', 'file', 'reference', 'repeater', 'group', 'select', 'multiselect'],
            required: true
          },
          required: { type: 'boolean', default: false },
          unique: { type: 'boolean', default: false },
          defaultValue: { type: 'any' },
          validation: { type: 'object' },
          options: { type: 'array' },
          settings: { type: 'object' }
        }
      },
      description: 'Field definitions for this content type'
    },
    
    // Display settings
    displayField: { type: 'string', description: 'Field used as title in lists' },
    listFields: { type: 'array', description: 'Fields to display in list view' },
    searchableFields: { type: 'array', description: 'Fields that are searchable' },
    
    // SEO defaults
    seoFields: {
      type: 'object',
      properties: {
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
        urlSlug: { type: 'string', description: 'Field to use for URL slug' }
      }
    },
    
    // Permissions
    permissions: {
      type: 'object',
      properties: {
        canCreate: { type: 'array', default: ['admin', 'editor'] },
        canRead: { type: 'array', default: ['admin', 'editor', 'user'] },
        canUpdate: { type: 'array', default: ['admin', 'editor'] },
        canDelete: { type: 'array', default: ['admin'] }
      }
    },
    
    status: {
      type: 'string',
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      description: 'Content type status'
    },
    
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true },
    createdBy: { type: 'string', references: 'users' }
  },
  
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['status'] }
  ]
};