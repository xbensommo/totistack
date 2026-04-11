/**
 * Forms Builder Feature Entry Point
 * @module features/forms
 * @description Main entry point for Forms Builder feature
 * @author Totistack Team
 * @date 2026-03-22
 */

import { createPiniaStore } from './stores/formsStore';
import formsService from './services/formsService';
import submissionService from './services/submissionService';
import validationService from './services/validationService';
import spamDetector from './services/spamDetector';

/**
 * Initialize Forms feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Forms Feature] Initializing...');
    
    // Validate dependencies
    if (!context.features?.auth || !context.features?.workflow) {
      throw new Error('Forms feature requires auth and workflow features');
    }
    
    // Initialize Pinia store
    let formsStore = null;
    if (context.pinia) {
      formsStore = createPiniaStore(context.pinia);
      console.debug('[Forms Feature] Pinia store registered');
    }
    
    // Initialize services
    await formsService.initialize(config, context.features.auth);
    await submissionService.initialize(config, formsService);
    await validationService.initialize(config);
    await spamDetector.initialize(config);
    
    // Register form endpoints
    if (context.httpServer) {
      context.httpServer.post('/api/forms/:formId/submit', submissionService.handleSubmission);
    }
    
    console.info('[Forms Feature] Initialized successfully');
    
    return {
      formsService,
      submissionService,
      validationService,
      spamDetector,
      formsStore
    };
    
  } catch (error) {
    console.error('[Forms Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize forms feature: ${error.message}`);
  }
}

export { formsService, submissionService, validationService, spamDetector };
export default { initialize };
```

## File: `src/features/forms/collections/forms.collection.js`

```javascript
/**
 * Forms Collection Definition
 * @module features/forms/collections/forms
 * @description Form definitions with fields, validation, and settings
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'forms',
  description: 'Form definitions with fields and settings',
  
  schema: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    slug: { type: 'string', required: true, unique: true },
    description: { type: 'string' },
    
    // Form settings
    settings: {
      type: 'object',
      properties: {
        submitButtonText: { type: 'string', default: 'Submit' },
        successMessage: { type: 'string', default: 'Thank you for your submission!' },
        redirectUrl: { type: 'string' },
        requireLogin: { type: 'boolean', default: false },
        limitSubmissions: { type: 'boolean', default: false },
        maxSubmissions: { type: 'number', default: 1000 },
        enableCaptcha: { type: 'boolean', default: false },
        saveSubmissions: { type: 'boolean', default: true }
      }
    },
    
    // Email notifications
    notifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['admin', 'user', 'custom'] },
          to: { type: 'string' },
          subject: { type: 'string' },
          template: { type: 'string' }
        }
      }
    },
    
    // Webhooks
    webhooks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          method: { type: 'string', default: 'POST' },
          headers: { type: 'object' },
          triggerOn: { type: 'string', default: 'submission' }
        }
      }
    },
    
    // Design
    design: {
      type: 'object',
      properties: {
        theme: { type: 'string', default: 'default' },
        customCss: { type: 'string' },
        layout: { type: 'string', enum: ['vertical', 'horizontal', 'inline'], default: 'vertical' }
      }
    },
    
    status: {
      type: 'string',
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    
    totalSubmissions: { type: 'number', default: 0 },
    
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true },
    createdBy: { type: 'string', references: 'users' }
  },
  
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
};