/**
 * Forms Builder Feature Manifest
 * @module features/forms
 * @description Drag-and-drop forms builder with submissions, validation, and workflows
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'forms',
  name: 'Forms Builder',
  version: '2.0.0',
  description: 'Visual forms builder with conditional logic, submissions, and integrations',
  
  dependencies: {
    features: ['auth', 'rbac', 'workflow'],
    apps: []
  },
  
  configSchema: {
    type: 'object',
    properties: {
      maxSubmissionsPerForm: { type: 'number', default: 10000 },
      enableSpamProtection: { type: 'boolean', default: true },
      spamScoreThreshold: { type: 'number', default: 5 },
      fileUploadMaxSize: { type: 'number', default: 10485760 },
      allowedFileTypes: { type: 'array', default: ['jpg', 'png', 'pdf', 'doc', 'docx'] }
    }
  },
  
  collections: [
    'forms',
    'formSubmissions',
    'formFields',
    'formRules',
    'formWebhooks'
  ],
  
  services: ['formsService', 'submissionService', 'validationService', 'spamDetector'],
  
  stores: ['forms'],
  
  components: ['FormBuilder', 'FormRenderer', 'FormSubmissions', 'FormAnalytics'],
  
  hooks: ['onFormSubmit', 'onFormValidation', 'onFormSpamDetected']
};