/**
 * @file forms/services/formsService.js
 * @description Root-store compatible service factory for the forms feature.
 */
import { useAppStore } from '@app/stores/appStore'
import {
  assertAccess,
  createId,
  fetchDirectCollectionItems,
  normalizeError,
  slugify,
} from '../../shared/featureToolkit.js'
import { DEFAULT_FORM_SETTINGS } from '../utils/formDefaults.js'

/**
 * @typedef {object} FormsServiceContext
 * @property {object} [appStore]
 * @property {object} [access]
 * @property {object} [services]
 * @property {object} [config]
 */

/**
 * Create the forms feature service.
 *
 * @param {FormsServiceContext} context
 * @returns {object}
 */
export function createFormsService({ appStore, access, services = {}, config = {} } = {}) {
  const store = appStore || useAppStore()
  const featureAccess = access || store?.access || null
  const formsActions = store?.formsActions
  if (!formsActions) throw new Error('Missing root-store shard actions: store.formsActions')
  const fieldActions = store?.formFieldsActions
  if (!fieldActions) throw new Error('Missing root-store shard actions: store.formFieldsActions')
  const submissionActions = store?.formSubmissionsActions
  if (!submissionActions) throw new Error('Missing root-store shard actions: store.formSubmissionsActions')
  const webhookActions = store?.formWebhooksActions
  if (!webhookActions) throw new Error('Missing root-store shard actions: store.formWebhooksActions')

  const settings = {
    maxFieldsPerForm: 50,
    enablePublicSubmissions: true,
    spamScoreThreshold: 5,
    ...config,
  }

  async function listForms(options = {}) {
    return fetchDirectCollectionItems(store, 'forms', formsActions, options)
  }

  async function getFormById(formId) {
    try {
      return await formsActions.getById(formId)
    } catch (error) {
      throw normalizeError(error, 'Unable to load the selected form.')
    }
  }

  async function getFormBySlug(slug) {
    const forms = await listForms({ filters: [{ field: 'slug', op: '==', value: slug }] })
    return forms.find((item) => item.slug === slug) || null
  }

  async function listFields(formId, options = {}) {
    const items = await fetchDirectCollectionItems(store, 'formFields', fieldActions, {
      ...options,
      filters: [...(Array.isArray(options.filters) ? options.filters : []), { field: 'formId', op: '==', value: formId }],
      sort: { field: 'order', direction: 'asc' },
    })
    return items.filter((item) => item.formId === formId).sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async function listSubmissions(formId, options = {}) {
    const items = await fetchDirectCollectionItems(store, 'formSubmissions', submissionActions, {
      ...options,
      filters: [...(Array.isArray(options.filters) ? options.filters : []), { field: 'formId', op: '==', value: formId }],
    })
    return items.filter((item) => item.formId === formId)
  }

  async function createForm(payload) {
    try {
      assertAccess(featureAccess, 'forms.manage', 'You are not allowed to create forms.')
      const now = new Date().toISOString()
      const formId = createId('form')
      const fields = Array.isArray(payload.fields) ? payload.fields.slice(0, settings.maxFieldsPerForm) : []
      const formRecord = {
        name: payload.name?.trim(),
        slug: payload.slug?.trim() || slugify(payload.name),
        description: payload.description?.trim() || '',
        status: payload.status || 'draft',
        settings: { ...DEFAULT_FORM_SETTINGS, ...(payload.settings || {}) },
        notifications: payload.notifications || [],
        integrations: payload.integrations || [],
        fieldsCount: fields.length,
        totalSubmissions: 0,
        createdAt: now,
        updatedAt: now,
      }

      if (!formRecord.name) {
        throw new Error('Form name is required.')
      }

      await formsActions.setById(formId, formRecord)

      for (const [index, field] of fields.entries()) {
        const fieldId = createId('field')
        await fieldActions.setById(fieldId, {
          formId,
          label: field.label?.trim() || `Field ${index + 1}`,
          key: field.key?.trim() || slugify(field.label || `field-${index + 1}`),
          type: field.type || 'text',
          placeholder: field.placeholder || '',
          helpText: field.helpText || '',
          isRequired: Boolean(field.isRequired),
          order: typeof field.order === 'number' ? field.order : index,
          config: field.config || {},
          validation: field.validation || {},
          options: field.options || [],
          createdAt: now,
          updatedAt: now,
        })
      }

      return { id: formId, ...formRecord }
    } catch (error) {
      throw normalizeError(error, 'Unable to create the form.')
    }
  }

  async function updateForm(formId, updates) {
    try {
      assertAccess(featureAccess, 'forms.manage', 'You are not allowed to update forms.')
      await formsActions.update(formId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      return getFormById(formId)
    } catch (error) {
      throw normalizeError(error, 'Unable to update the form.')
    }
  }

  async function saveField(formId, field) {
    try {
      assertAccess(featureAccess, 'forms.manage', 'You are not allowed to update form fields.')
      const fieldId = field.id || createId('field')
      const record = {
        formId,
        label: field.label?.trim() || 'Untitled field',
        key: field.key?.trim() || slugify(field.label || 'field'),
        type: field.type || 'text',
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        isRequired: Boolean(field.isRequired),
        order: typeof field.order === 'number' ? field.order : 0,
        config: field.config || {},
        validation: field.validation || {},
        options: field.options || [],
        updatedAt: new Date().toISOString(),
      }
      if (field.id) {
        await fieldActions.update(fieldId, record)
      } else {
        await fieldActions.setById(fieldId, { ...record, createdAt: record.updatedAt })
      }
      return { id: fieldId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the form field.')
    }
  }

  async function submitForm(formReference, payload, options = {}) {
    try {
      const form = formReference?.id ? formReference : await getFormBySlug(formReference)
      if (!form) {
        throw new Error('The requested form could not be found.')
      }
      if (!settings.enablePublicSubmissions) {
        throw new Error('Public submissions are disabled for this project.')
      }
      const fields = await listFields(form.id)
      const missingRequired = fields.filter((field) => field.isRequired && !payload?.[field.key])
      if (missingRequired.length > 0) {
        throw new Error(`Required fields are missing: ${missingRequired.map((field) => field.label).join(', ')}`)
      }

      const submissionId = createId('submission')
      const spamScore = options.spamScore || 0
      const submission = {
        formId: form.id,
        formSlug: form.slug,
        status: spamScore >= settings.spamScoreThreshold ? 'flagged' : 'new',
        payload,
        spamScore,
        source: options.source || 'web',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      await submissionActions.setById(submissionId, submission)
      await formsActions.update(form.id, {
        totalSubmissions: Number(form.totalSubmissions || 0) + 1,
        updatedAt: new Date().toISOString(),
      })

      if (Array.isArray(form.integrations) && form.integrations.length > 0 && typeof services?.workflowService?.handleFormSubmission === 'function') {
        await services.workflowService.handleFormSubmission({ form, submission: { id: submissionId, ...submission } })
      }

      return { id: submissionId, ...submission }
    } catch (error) {
      throw normalizeError(error, 'Unable to submit the form.')
    }
  }

  async function saveWebhook(formId, payload) {
    try {
      assertAccess(featureAccess, 'forms.manage', 'You are not allowed to manage form webhooks.')
      const webhookId = payload.id || createId('webhook')
      const record = {
        formId,
        name: payload.name?.trim() || 'Submission webhook',
        url: payload.url?.trim() || '',
        method: payload.method || 'POST',
        isActive: payload.isActive !== false,
        headers: payload.headers || {},
        triggerOn: payload.triggerOn || 'submission',
        lastTriggeredAt: payload.lastTriggeredAt || null,
        updatedAt: new Date().toISOString(),
      }
      if (!record.url) {
        throw new Error('Webhook URL is required.')
      }
      if (payload.id) {
        await webhookActions.update(webhookId, record)
      } else {
        await webhookActions.setById(webhookId, { ...record, createdAt: record.updatedAt })
      }
      return { id: webhookId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the form webhook.')
    }
  }

  return {
    settings,
    listForms,
    getFormById,
    getFormBySlug,
    listFields,
    listSubmissions,
    createForm,
    updateForm,
    saveField,
    submitForm,
    saveWebhook,
  }
}

export default createFormsService
