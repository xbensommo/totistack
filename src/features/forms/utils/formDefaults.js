/**
 * @file forms/utils/formDefaults.js
 * @description Form defaults and starter field blueprints.
 */
export const DEFAULT_FORM_SETTINGS = Object.freeze({
  submitButtonText: 'Submit',
  successMessage: 'Thank you. Your submission has been received.',
  requireLogin: false,
  limitSubmissions: false,
  maxSubmissions: 1000,
  saveSubmissions: true,
  enableCaptcha: false,
  redirectUrl: '',
})

export const FIELD_LIBRARY = Object.freeze([
  { type: 'text', label: 'Text input', config: { width: 'full' } },
  { type: 'email', label: 'Email field', config: { width: 'full' } },
  { type: 'textarea', label: 'Long text', config: { width: 'full', rows: 4 } },
  { type: 'select', label: 'Select list', config: { width: 'full' }, options: ['Option A', 'Option B'] },
  { type: 'checkbox', label: 'Consent checkbox', config: { width: 'full' } },
  { type: 'file', label: 'File upload', config: { width: 'full', accepts: ['pdf', 'jpg', 'png'] } },
])
