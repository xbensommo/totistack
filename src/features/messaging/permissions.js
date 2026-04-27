/**
 * @file permissions.js
 * @description Declarative permission registry for the messaging app.
 */

export default {
  module: 'messaging',
  permissions: [
    { key: 'messaging.threads.read', resource: 'threads', action: 'read', description: 'View threads.' },
    { key: 'messaging.threads.create', resource: 'threads', action: 'create', description: 'Create threads.' },
    { key: 'messaging.threads.update', resource: 'threads', action: 'update', description: 'Update threads.' },
    { key: 'messaging.messages.read', resource: 'messages', action: 'read', description: 'View messages.' },
    { key: 'messaging.messages.send', resource: 'messages', action: 'send', description: 'Send messages.' },
    { key: 'messaging.messages.delete', resource: 'messages', action: 'delete', description: 'Delete messages.' },
    { key: 'messaging.templates.manage', resource: 'templates', action: 'manage', description: 'Manage messaging templates.' },
    { key: 'messaging.manage', resource: 'messaging', action: 'manage', description: 'Full control over messaging.' },
  ],
  roleTemplates: {
    admin: ['messaging.manage', 'messaging.templates.manage'],
    receptionist: ['messaging.threads.read', 'messaging.threads.create', 'messaging.messages.read', 'messaging.messages.send'],
    consultant: ['messaging.threads.read', 'messaging.messages.read', 'messaging.messages.send'],
    finance_officer: [],
    viewer: ['messaging.threads.read', 'messaging.messages.read'],
  },
}