/**
 * @file src/features/auth/auth.actions.js
 * @description Business action definitions for user role and status changes.
 */

import { AUTH_PERMISSIONS } from './permissions.js'

async function notify(services, event, payload) {
  if (typeof services?.notifications?.handleEvent === 'function') {
    await services.notifications.handleEvent(event, payload)
  }
}

export function createAuthActionDefinitions() {
  return [
    {
      type: 'auth.user.change-role',
      permission: AUTH_PERMISSIONS.CHANGE_ROLE,
      confirm(context) {
        const { target, payload } = context
        return {
          title: 'Change user role',
          message: `Change ${target?.displayName || target?.email || 'this user'} to ${payload?.nextRole}?`,
          confirmText: 'Change role',
          cancelText: 'Keep current role',
          variant: 'warning',
        }
      },
      async run(context) {
        const { services, target, payload, actor } = context
        if (typeof services?.auth?.updateUserRole !== 'function') {
          throw new Error('The auth service does not implement updateUserRole().')
        }
        const result = await services.auth.updateUserRole(target.id, payload.nextRole)
        await notify(services, 'user.role.changed', {
          recipientId: target?.id || target?.uid || null,
          roleName: payload?.nextRole || '',
          actorId: actor?.id || actor?.uid || null,
          actorName: actor?.displayName || actor?.email || 'System',
          entityId: target?.id || target?.uid || null,
          entityLabel: target?.displayName || target?.email || 'User',
        })
        return result
      },
    },
    {
      type: 'auth.user.suspend',
      permission: AUTH_PERMISSIONS.SUSPEND_USER,
      confirm(context) {
        const { target } = context
        return {
          title: 'Suspend user',
          message: `Suspend ${target?.displayName || target?.email || 'this user'} and block access?`,
          confirmText: 'Suspend user',
          cancelText: 'Cancel',
          variant: 'danger',
        }
      },
      async run(context) {
        const { services, target, actor } = context
        if (typeof services?.auth?.suspendUser !== 'function') {
          throw new Error('The auth service does not implement suspendUser().')
        }
        const result = await services.auth.suspendUser(target.id)
        await notify(services, 'user.suspended', {
          recipientId: target?.id || target?.uid || null,
          actorId: actor?.id || actor?.uid || null,
          actorName: actor?.displayName || actor?.email || 'System',
          entityId: target?.id || target?.uid || null,
          entityLabel: target?.displayName || target?.email || 'User',
        })
        return result
      },
    },
  ]
}

export default createAuthActionDefinitions
