/**
 * @file forms/services/formsService.js
 * @description Root-store compatible service factory for the forms feature.
 */
import { useAppStore } from '@app/stores/appStore'
import {
  assertAccess,
  createId,
  createLegacyService,
  fetchCollectionItems,
  getCollectionActions,
  normalizeError,
  runAction,
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
  const formsActions = getCollectionActions(store, 'forms')
  const fieldActions = getCollectionActions(store, 'formFields')
  const submissionActions = getCollectionActions(store, 'formSubmissions')
  const webhookActions = getCollectionActions(store, 'formWebhooks')

  const settings = {
    maxFieldsPerForm: 50,
    enablePublicSubmissions: true,
    spamScoreThreshold: 5,
    ...config,
  }

  async function listForms(options = {}) {
    return fetchCollectionItems(store, 'forms', options)
  }

  async function getFormById(formId) {
    try {
      return await runAction(formsActions, ['getById'], formId)
    } catch (error) {
      throw normalizeError(error, 'Unable to load the selected form.')
    }
  }

  async function getFormBySlug(slug) {
    const forms = await listForms({ filters: { slug } })
    return forms.find((item) => item.slug === slug) || null
  }

  async function listFields(formId, options = {}) {
    const items = await fetchCollectionItems(store, 'formFields', {
      ...options,
      filters: { ...(options.filters || {}), formId },
      sort: { field: 'order', direction: 'asc' },
    })
    return items.filter((item) => item.formId === formId).sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async function listSubmissions(formId, options = {}) {
    const items = await fetchCollectionItems(store, 'formSubmissions', {
      ...options,
      filters: { ...(options.filters || {}), formId },
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

      await runAction(formsActions, ['setById', 'create', 'add'], formId, formRecord)

      for (const [index, field] of fields.entries()) {
        const fieldId = createId('field')
        await runAction(fieldActions, ['setById', 'create', 'add'], fieldId, {
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
      await runAction(formsActions, ['update'], formId, {
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
        await runAction(fieldActions, ['update'], fieldId, record)
      } else {
        await runAction(fieldActions, ['setById', 'create', 'add'], fieldId, { ...record, createdAt: record.updatedAt })
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

      await runAction(submissionActions, ['setById', 'create', 'add'], submissionId, submission)
      await runAction(formsActions, ['update'], form.id, {
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
        await runAction(webhookActions, ['update'], webhookId, record)
      } else {
        await runAction(webhookActions, ['setById', 'create', 'add'], webhookId, { ...record, createdAt: record.updatedAt })
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

const legacyService = createLegacyService(() => createFormsService({ appStore: useAppStore() }))
export default legacyService
