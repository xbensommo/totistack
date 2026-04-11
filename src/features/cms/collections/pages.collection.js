
/**
 * Pages Collection Definition
 * @module features/cms/collections/pages
 * @description Page definitions with block-based structure
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'pages',
  description: 'CMS pages with block-based layout',
  
  schema: {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true, unique: true, description: 'URL path' },
    path: { type: 'string', description: 'Full URL path with parent hierarchy' },
    
    // Page structure
    template: { type: 'string', default: 'default', description: 'Page template name' },
    blocks: {
      type: 'array',
      description: 'Page content blocks',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          type: { type: 'string', required: true },
          order: { type: 'number' },
          content: { type: 'object' },
          settings: { type: 'object' }
        }
      }
    },
    
    // Parent-child relationships
    parentId: { type: 'string', references: 'pages', description: 'Parent page' },
    children: { type: 'array', description: 'Child page IDs' },
    
    // Navigation
    showInNav: { type: 'boolean', default: false },
    navOrder: { type: 'number' },
    navLabel: { type: 'string' },
    
    // SEO
    seo: {
      type: 'object',
      properties: {
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
        metaKeywords: { type: 'string' },
        ogImage: { type: 'string' },
        canonical: { type: 'string' },
        noIndex: { type: 'boolean', default: false }
      }
    },
    
    // Publishing
    status: {
      type: 'string',
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft'
    },
    publishedAt: { type: 'date' },
    scheduledAt: { type: 'date' },
    
    // Versioning
    version: { type: 'number', default: 1 },
    
    // Metadata
    createdBy: { type: 'string', references: 'users' },
    updatedBy: { type: 'string', references: 'users' },
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true }
  },
  
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['path'] },
    { fields: ['status', 'publishedAt'] },
    { fields: ['parentId'] },
    { fields: ['showInNav', 'navOrder'] }
  ],
  
  hooks: {
    beforeCreate: ['generatePath', 'validateSlugUniqueness'],
    afterCreate: ['updateParentChildren', 'generateSitemap'],
    beforeUpdate: ['handleVersioning', 'checkSlugChange'],
    afterUpdate: ['invalidateCache', 'notifySearchEngines']
  }
};