/**
 * @file collections.config.js
 * @description Configuration for all collections in the project
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  // Collection definitions
  collections: {
    {{#each collections}}
    '{{name}}': {
      // Collection metadata
      name: '{{name}}',
      label: '{{label}}',
      labelPlural: '{{labelPlural}}',
      icon: '{{icon}}',
      
      // Provider settings
      provider: '{{provider}}',
      adapter: '{{adapter}}',
      collectionPath: '{{collectionPath}}',
      
      // CRUD settings
      crud: {
        list: true,
        create: true,
        edit: true,
        delete: true,
        details: true,
        softDelete: {{softDelete}},
        archive: {{archive}}
      },
      
      // Field definitions
      fields: {
        {{#each fields}}
        '{{name}}': {
          type: '{{type}}',
          label: '{{label}}',
          required: {{required}},
          unique: {{unique}},
          default: {{default}},
          validation: {{toJSON validation}}
        },
        {{/each}}
      },
      
      // Display settings
      display: {
        listColumns: {{listColumns}},
        sortBy: 'createdAt',
        sortOrder: 'desc',
        itemsPerPage: 25
      },
      
      // Relationships
      relationships: {
        {{#each relationships}}
        '{{name}}': {
          type: '{{type}}',
          collection: '{{collection}}',
          field: '{{field}}'
        },
        {{/each}}
      }
    },
    {{/each}}
  }
};