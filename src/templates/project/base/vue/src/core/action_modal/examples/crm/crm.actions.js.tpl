/**
 * @file src/examples/crm/crm.actions.js
 * @description Example enterprise CRM action definitions for approval flows.
 */

/**
 * Build CRM action definitions.
 *
 * @returns {Array<Record<string, any>>}
 */
export function createCrmActionDefinitions() {
  return [
    {
      type: 'crm.client.approve',
      confirm(context) {
        const name = context.target?.name || context.target?.companyName || 'this client';
        return {
          title: 'Approve client',
          message: `Approve ${name} and allow the CRM workflow to continue?`,
          confirmText: 'Approve client',
          cancelText: 'Not now',
          variant: 'success',
        };
      },
      async run(context) {
        const { services, target } = context;
        return services.crm.approveClient(target.id);
      },
      async onSuccess(context) {
        await context.services.toast?.success?.('Client approved successfully.');
      },
      async onError(error, context) {
        await context.services.toast?.error?.(error?.message || 'Client approval failed.');
      },
    },
  ];
}
