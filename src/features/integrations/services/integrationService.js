/**
 * @file integrations/services/integrationService.js
 * @description Root-store compatible service factory for the integrations feature.
 */
import { useAppStore } from '@/stores/appStore'
import {
  assertAccess,
  createId,
  createLegacyService,
  fetchCollectionItems,
  getCollectionActions,
  normalizeError,
  runAction,
} from '../../shared/featureToolkit.js'

const BUILT_IN_PROVIDERS = Object.freeze([
  { id: 'stripe', name: 'Stripe', category: 'payments' },
  { id: 'sendgrid', name: 'SendGrid', category: 'email' },
  { id: 'slack', name: 'Slack', category: 'messaging' },
  { id: 'twilio', name: 'Twilio', category: 'sms' },
  { id: 'openai', name: 'OpenAI', category: 'ai' },
])

/**
 * Create the integrations feature service.
 *
 * @param {object} context
 * @returns {object}
 */
export function createIntegrationsService({ appStore, access, config = {} } = {}) {
  const store = appStore || useAppStore()
  const featureAccess = access || store?.access || null
  const integrationActions = getCollectionActions(store, 'integrations')
  const webhookActions = getCollectionActions(store, 'integrationWebhooks')
  const logActions = getCollectionActions(store, 'integrationLogs')
  const settings = { allowedProviders: BUILT_IN_PROVIDERS.map((item) => item.id), ...config }

  async function listProviders() {
    return BUILT_IN_PROVIDERS.filter((item) => settings.allowedProviders.includes(item.id))
  }

  async function listIntegrations(options = {}) {
    return fetchCollectionItems(store, 'integrations', options)
  }

  async function getIntegrationById(integrationId) {
    try {
      return await runAction(integrationActions, ['getById'], integrationId)
    } catch (error) {
      throw normalizeError(error, 'Unable to load the selected integration.')
    }
  }

  async function saveIntegration(payload) {
    try {
      assertAccess(featureAccess, 'integrations.manage', 'You are not allowed to manage integrations.')
      const provider = BUILT_IN_PROVIDERS.find((item) => item.id === payload.provider)
      if (!provider) {
        throw new Error('Unsupported integration provider.')
      }
      const integrationId = payload.id || createId('integration')
      const record = {
        provider: provider.id,
        name: payload.name?.trim() || provider.name,
        category: payload.category || provider.category,
        status: payload.status || 'draft',
        environment: payload.environment || 'sandbox',
        credentials: payload.credentials || {},
        config: payload.config || {},
        health: payload.health || { status: 'unknown', lastCheckedAt: null },
        lastSyncedAt: payload.lastSyncedAt || null,
        updatedAt: new Date().toISOString(),
      }
      if (payload.id) {
        await runAction(integrationActions, ['update'], integrationId, record)
      } else {
        await runAction(integrationActions, ['setById', 'create', 'add'], integrationId, { ...record, createdAt: record.updatedAt })
      }
      await recordLog({ integrationId, provider: provider.id, level: 'info', event: 'integration.saved', message: `Integration ${record.name} saved.` })
      return { id: integrationId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the integration.')
    }
  }

  async function testConnection(integrationId) {
    const integration = await getIntegrationById(integrationId)
    if (!integration) {
      throw new Error('Integration not found.')
    }
    const simulated = {
      status: integration.credentials && Object.keys(integration.credentials).length > 0 ? 'healthy' : 'warning',
      checkedAt: new Date().toISOString(),
      message: integration.credentials && Object.keys(integration.credentials).length > 0
        ? 'Credentials look present. Replace this simulated check with a live provider probe.'
        : 'No credentials are stored yet.',
    }
    await runAction(integrationActions, ['update'], integrationId, {
      health: simulated,
      status: simulated.status === 'healthy' ? 'connected' : 'error',
      lastSyncedAt: simulated.checkedAt,
      updatedAt: simulated.checkedAt,
    })
    await recordLog({ integrationId, provider: integration.provider, level: simulated.status === 'healthy' ? 'info' : 'warning', event: 'integration.tested', message: simulated.message })
    return simulated
  }

  async function saveWebhook(integrationId, payload) {
    try {
      assertAccess(featureAccess, 'integrations.manage', 'You are not allowed to manage integration webhooks.')
      const webhookId = payload.id || createId('webhook')
      const record = {
        integrationId,
        name: payload.name?.trim() || 'Webhook endpoint',
        url: payload.url?.trim() || '',
        event: payload.event?.trim() || 'default.event',
        method: payload.method || 'POST',
        secretKeyRef: payload.secretKeyRef || '',
        isActive: payload.isActive !== false,
        lastDeliveredAt: payload.lastDeliveredAt || null,
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
      throw normalizeError(error, 'Unable to save the webhook endpoint.')
    }
  }

  async function listLogs(options = {}) {
    return fetchCollectionItems(store, 'integrationLogs', options)
  }

  async function recordLog(payload) {
    const logId = createId('integration-log')
    const record = {
      integrationId: payload.integrationId,
      provider: payload.provider,
      level: payload.level || 'info',
      event: payload.event || 'integration.event',
      message: payload.message || 'Integration event recorded.',
      context: payload.context || {},
      createdAt: new Date().toISOString(),
    }
    await runAction(logActions, ['setById', 'create', 'add'], logId, record)
    return { id: logId, ...record }
  }

  return {
    settings,
    listProviders,
    listIntegrations,
    getIntegrationById,
    saveIntegration,
    testConnection,
    saveWebhook,
    listLogs,
    recordLog,
  }
}

const legacyService = createLegacyService(() => createIntegrationsService({ appStore: useAppStore() }))
export default legacyService
