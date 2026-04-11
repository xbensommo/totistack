
/**
 * Form Fields Collection Definition
 * @module features/forms/collections/formFields
 * @description Form field definitions with validation and conditional logic
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'formFields',
  description: 'Form fields with validation and conditional logic',
  
  schema: {
    id: { type: 'string', required: true },
    formId: { type: 'string', required: true, references: 'forms' },
    
    // Field definition
    fieldId: { type: 'string', required: true },
    label: { type: 'string', required: true },
    type: {
      type: 'string',
      required: true,
      enum: [
        'text', 'email', 'number', 'tel', 'url', 'textarea', 'richtext',
        'select', 'multiselect', 'radio', 'checkbox', 'toggle',
        'date', 'datetime', 'time',
        'file', 'image',
        'rating', 'slider',
        'heading', 'paragraph', 'html', 'divider',
        'address', 'name', 'phone'
      ]
    },
    placeholder: { type: 'string' },
    description: { type: 'string' },
    defaultValue: { type: 'any' },
    
    // Options for select, radio, etc.
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'any' },
          selected: { type: 'boolean' }
        }
      }
    },
    
    // Validation rules
    validation: {
      type: 'object',
      properties: {
        required: { type: 'boolean', default: false },
        min: { type: 'number' },
        max: { type: 'number' },
        minLength: { type: 'number' },
        maxLength: { type: 'number' },
        pattern: { type: 'string' },
        customMessage: { type: 'string' }
      }
    },
    
    // Conditional logic
    conditions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fieldId: { type: 'string' },
          operator: { type: 'string', enum: ['eq', 'neq', 'gt', 'lt', 'contains', 'empty', 'notEmpty'] },
          value: { type: 'any' },
          action: { type: 'string', enum: ['show', 'hide', 'require', 'disable'] }
        }
      }
    },
    
    // Layout
    width: { type: 'number', min: 1, max: 12, default: 12 },
    order: { type: 'number', required: true },
    
    // Advanced settings
    settings: {
      type: 'object',
      properties: {
        autoComplete: { type: 'string' },
        multiple: { type: 'boolean' },
        accept: { type: 'string' },
        maxFileSize: { type: 'number' },
        rows: { type: 'number' }
      }
    },
    
    isActive: { type: 'boolean', default: true },
    
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true }
  },
  
  indexes: [
    { fields: ['formId', 'order'] }
  ]
};