/** @file src/apps/client-records/client-records.actions.js */

function getClientService(context) {
  const service = context?.service || context?.services?.clientRecords || context?.services?.clientService
  if (!service) throw new Error('Client Records service is not configured for this action.')
  return service
}

function clientId(context) {
  return context?.target?.id || context?.id || context?.clientId
}

export function createClientRecordActionDefinitions() {
  return [
    {
      type: 'client-records.update',
      confirm: ({ target }) => ({
        title: 'Update client',
        message: `Update ${target?.displayName || target?.name || 'this client record'}?`,
        confirmText: 'Update client',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getClientService(context).updateClient(clientId(context), context.payload || {}),
    },
    {
      type: 'client-records.archive',
      confirm: ({ target }) => ({
        title: 'Archive client',
        message: `Archive ${target?.displayName || target?.name || 'this client record'}?`,
        confirmText: 'Archive client',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getClientService(context).archiveClient(clientId(context), context.payload || {}),
    },
  ]
}

export default createClientRecordActionDefinitions
