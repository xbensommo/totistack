/** @file src/features/integrations/integrations.actions.js */

function getIntegrationsService(context) {
  const service = context?.service || context?.services?.integrations || context?.services?.integrationsService
  if (!service) throw new Error('Integrations service is not configured for this action.')
  return service
}

export function createIntegrationsActionDefinitions() {
  return [
    {
      type: 'integrations.integration.save',
      confirm: ({ target, payload }) => ({
        title: 'Save integration',
        message: `Save ${target?.name || payload?.name || 'this integration'}?`,
        confirmText: 'Save integration',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getIntegrationsService(context).saveIntegration({ ...(context.payload || {}), id: context.target?.id || context.id || context.payload?.id }),
    },
    {
      type: 'integrations.connection.test',
      confirm: ({ target }) => ({
        title: 'Test integration',
        message: `Test ${target?.name || 'this integration'} connection?`,
        confirmText: 'Test connection',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getIntegrationsService(context).testConnection(context.target?.id || context.id || context.integrationId),
    },
    {
      type: 'integrations.webhook.save',
      confirm: ({ target, payload }) => ({
        title: 'Save webhook',
        message: `Save ${target?.name || payload?.name || payload?.url || 'this webhook'}?`,
        confirmText: 'Save webhook',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getIntegrationsService(context).saveWebhook(context.payload || {}),
    },
  ]
}

export default createIntegrationsActionDefinitions
