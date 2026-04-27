/**
 * @file src/examples/auth/auth.actions.js
 * @description Example enterprise auth action definitions for role changes.
 */

/**
 * Build auth action definitions.
 *
 * @returns {Array<Record<string, any>>}
 */
export function createAuthActionDefinitions() {
  return [
    {
      type: 'auth.user.change-role',
      confirm(context) {
        const { target, payload } = context;
        return {
          title: 'Change user role',
          message: `Change ${target?.displayName || target?.email || 'this user'} to ${payload?.nextRole}?`,
          confirmText: 'Change role',
          cancelText: 'Keep current role',
          variant: 'warning',
        };
      },
      async run(context) {
        const { services, target, payload } = context;
        return services.auth.updateUserRole(target.id, payload.nextRole);
      },
      async onSuccess(context) {
        await context.services.toast?.success?.('User role updated successfully.');
      },
      async onError(error, context) {
        await context.services.toast?.error?.(error?.message || 'Failed to change user role.');
      },
    },
  ];
}
