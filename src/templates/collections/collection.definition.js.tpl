/**
 * @file definition.js
 * @description Collection definition for {{collectionName}}
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  // Basic information
  name: '{{collectionName}}',
  label: '{{label}}',
  labelPlural: '{{labelPlural}}',
  description: '{{description}}',
  icon: '{{icon}}',
  
  // Provider configuration
  provider: '{{provider}}',
  adapter: '{{adapter}}',
  collectionPath: '{{collectionPath}}',
  
  // Collection settings
  settings: {
    softDelete: {{softDelete}},
    archive: {{archive}},
    timestamps: true,
    optimisticLocking: false,
    cacheEnabled: true,
    cacheTTL: 300 // seconds
  },
  
  // Field definitions
  fields: {
    {{#each fields}}
    '{{name}}': {
      type: '{{type}}',
      label: '{{label}}',
      description: '{{description}}',
      required: {{required}},
      unique: {{unique}},
      default: {{default}},
      placeholder: '{{placeholder}}',
      validation: {{toJSON validation}},
      options: {{toJSON options}},
      
      // UI hints
      ui: {
        component: '{{uiComponent}}',
        width: '{{width}}',
        order: {{order}}
      }
    },
    {{/each}}
    
    // Standard fields
    createdAt: {
      type: 'timestamp',
      label: 'Created At',
      readOnly: true,
      default: 'serverTimestamp'
    },
    updatedAt: {
      type: 'timestamp',
      label: 'Updated At',
      readOnly: true,
      default: 'serverTimestamp'
    },
    createdBy: {
      type: 'reference',
      label: 'Created By',
      ref: 'users',
      readOnly: true
    },
    updatedBy: {
      type: 'reference',
      label: 'Updated By',
      ref: 'users',
      readOnly: true
    }
    {{#if softDelete}}
    ,
    deletedAt: {
      type: 'timestamp',
      label: 'Deleted At',
      readOnly: true
    },
    deletedBy: {
      type: 'reference',
      label: 'Deleted By',
      ref: 'users',
      readOnly: true
    }
    {{/if}}
  },
  
  // Indexes for queries
  indexes: [
    {{#each indexes}}
    {
      fields: {{toJSON fields}},
      unique: {{unique}}
    },
    {{/each}}
  ],
  
  // Hooks
  hooks: {
    beforeCreate: async (data) => {
      // Add custom logic before create
      return data;
    },
    afterCreate: async (doc) => {
      // Add custom logic after create
      return doc;
    },
    beforeUpdate: async (id, data) => {
      // Add custom logic before update
      return data;
    },
    afterUpdate: async (id, doc) => {
      // Add custom logic after update
      return doc;
    },
    beforeDelete: async (id) => {
      // Add custom logic before delete
      return true;
    },
    afterDelete: async (id) => {
      // Add custom logic after delete
    }
  }
};