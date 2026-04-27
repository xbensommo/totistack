/**
 * @file src/features/auth/auth.actions.js
 * @description Business action definitions for sensitive user access changes.
 */

import { AUTH_PERMISSIONS } from './permissions.js'

async function notify(services, event, payload) {
  if (typeof services?.notifications?.handleEvent === 'function') {
    await services.notifications.handleEvent(event, payload)
  }
}

async function audit(services, payload) {
  if (typeof services?.audit?.record === 'function') return services.audit.record(payload)
  if (typeof services?.audit?.recordSecurityEvent === 'function') return services.audit.recordSecurityEvent(payload)
  return undefined
}

export function createAuthActionDefinitions() {
  return [
    {
      type: 'auth.user.change-role',
      permission: AUTH_PERMISSIONS.ROLE_ASSIGN,
      confirm(context) {
        const { target, payload } = context
        return {
          title: 'Change user role',
          message: `Change ${target?.displayName || target?.email || 'this user'} to ${payload?.nextRole}? This is a privileged access change and will be audited.`,
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
        const result = await services.auth.updateUserRole(target.id || target.uid, payload.nextRole)
        await audit(services, {
          actionId: 'auth.user.role_changed',
          actorId: actor?.id || actor?.uid || null,
          actorEmail: actor?.email || null,
          entityType: 'users',
          entityId: target?.id || target?.uid || null,
          status: 'success',
          severity: 'warning',
          after: { role: payload?.nextRole || '' },
        })
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
          message: `Suspend ${target?.displayName || target?.email || 'this user'} and block access? This action is audited.`,
          confirmText: 'Suspend user',
          cancelText: 'Cancel',
          variant: 'danger',
        }
      },
      async run(context) {
        const { services, target, payload = {}, actor } = context
        if (typeof services?.auth?.suspendUser !== 'function') {
          throw new Error('The auth service does not implement suspendUser().')
        }
        const result = await services.auth.suspendUser(target.id || target.uid, payload.reason || '')
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
