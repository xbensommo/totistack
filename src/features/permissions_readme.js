Below are the individual permissions.js files.

Use this comment at the top of every file:

/**
 * @file permissions.js
 * @description Declarative permission registry for this module.
 *
 * Rules:
 * - Use <module>.<resource>.<action>
 * - Keep actions standard across Totistack
 * - roleTemplates are defaults only; final user permissions are resolved by generated access registries
 */

This follows the permission language and per-module file structure you already defined.





src/features/forms/permissions.js

src/features/notifications/permissions.js

src/features/files/permissions.js

src/features/seo/permissions.js
/**
 * @file permissions.js
 * @description Declarative permission registry for the seo feature.
 */

export default {
  module: 'seo',
  permissions: [
    { key: 'seo.meta.read', resource: 'meta', action: 'read', description: 'View SEO metadata.' },
    { key: 'seo.meta.update', resource: 'meta', action: 'update', description: 'Update SEO metadata.' },
    { key: 'seo.sitemap.generate', resource: 'sitemap', action: 'generate', description: 'Generate sitemap output.' },
    { key: 'seo.redirects.manage', resource: 'redirects', action: 'manage', description: 'Manage SEO redirects.' },
    { key: 'seo.schema.manage', resource: 'schema', action: 'manage', description: 'Manage SEO schema definitions.' },
    { key: 'seo.manage', resource: 'seo', action: 'manage', description: 'Full control over SEO settings.' },
  ],
  roleTemplates: {
    admin: ['seo.manage', 'seo.sitemap.generate', 'seo.redirects.manage', 'seo.schema.manage'],
    receptionist: [],
    consultant: [],
    finance_officer: [],
    viewer: ['seo.meta.read'],
  },
}
src/apps/crm/permissions.js

src/apps/client-records/permissions.js

src/apps/booking/permissions.js

src/apps/dashboard/permissions.js

src/apps/finance/permissions.js

src/apps/cms/permissions.js

src/apps/messaging/permissions.js

src/apps/catalog/permissions.js

src/apps/payments/permissions.js
/**
 * @file permissions.js
 * @description Declarative permission registry for the payments app.
 */

export default {
  module: 'payments',
  permissions: [
    { key: 'payments.transactions.read', resource: 'transactions', action: 'read', description: 'View transactions.' },
    { key: 'payments.transactions.create', resource: 'transactions', action: 'create', description: 'Create transactions.' },
    { key: 'payments.transactions.update', resource: 'transactions', action: 'update', description: 'Update transactions.' },
    { key: 'payments.transactions.refund', resource: 'transactions', action: 'refund', description: 'Refund transactions.' },
    { key: 'payments.transactions.export', resource: 'transactions', action: 'export', description: 'Export transaction data.' },
    { key: 'payments.transactions.manage', resource: 'transactions', action: 'manage', description: 'Full control over transactions.' },

    { key: 'payments.methods.read', resource: 'methods', action: 'read', description: 'View payment methods.' },
    { key: 'payments.methods.configure', resource: 'methods', action: 'configure', description: 'Configure payment methods.' },
    { key: 'payments.methods.manage', resource: 'methods', action: 'manage', description: 'Full control over payment methods.' },

    { key: 'payments.reconciliation.read', resource: 'reconciliation', action: 'read', description: 'View reconciliations.' },
    { key: 'payments.reconciliation.execute', resource: 'reconciliation', action: 'execute', description: 'Run reconciliations.' },
    { key: 'payments.reconciliation.manage', resource: 'reconciliation', action: 'manage', description: 'Full control over reconciliations.' },
  ],
  roleTemplates: {
    admin: ['payments.transactions.manage', 'payments.methods.manage', 'payments.reconciliation.manage'],
    receptionist: ['payments.transactions.read'],
    consultant: ['payments.transactions.read'],
    finance_officer: ['payments.transactions.manage', 'payments.methods.read', 'payments.reconciliation.manage'],
    viewer: ['payments.transactions.read', 'payments.reconciliation.read'],
  },
}
src/apps/whatsapp/permissions.js
/**
 * @file permissions.js
 * @description Declarative permission registry for the whatsapp app.
 */

export default {
  module: 'whatsapp',
  permissions: [
    { key: 'whatsapp.messages.read', resource: 'messages', action: 'read', description: 'View WhatsApp messages.' },
    { key: 'whatsapp.messages.send', resource: 'messages', action: 'send', description: 'Send WhatsApp messages.' },

    { key: 'whatsapp.templates.read', resource: 'templates', action: 'read', description: 'View WhatsApp templates.' },
    { key: 'whatsapp.templates.create', resource: 'templates', action: 'create', description: 'Create WhatsApp templates.' },
    { key: 'whatsapp.templates.update', resource: 'templates', action: 'update', description: 'Update WhatsApp templates.' },
    { key: 'whatsapp.templates.delete', resource: 'templates', action: 'delete', description: 'Delete WhatsApp templates.' },
    { key: 'whatsapp.templates.manage', resource: 'templates', action: 'manage', description: 'Full control over WhatsApp templates.' },

    { key: 'whatsapp.sessions.configure', resource: 'sessions', action: 'configure', description: 'Configure WhatsApp sessions.' },
    { key: 'whatsapp.logs.read', resource: 'logs', action: 'read', description: 'View WhatsApp logs.' },
    { key: 'whatsapp.manage', resource: 'whatsapp', action: 'manage', description: 'Full control over WhatsApp integration.' },
  ],
  roleTemplates: {
    admin: ['whatsapp.manage', 'whatsapp.templates.manage', 'whatsapp.sessions.configure', 'whatsapp.logs.read'],
    receptionist: ['whatsapp.messages.read', 'whatsapp.messages.send', 'whatsapp.templates.read'],
    consultant: ['whatsapp.messages.read', 'whatsapp.messages.send'],
    finance_officer: [],
    viewer: ['whatsapp.messages.read', 'whatsapp.logs.read'],
  },
}
Notes

Use these files exactly as the module-local source of truth, then let the generated layer merge them into one registry during build-time, which matches the Totistack approach you already set.

The only naming decision I normalized is:

folder can stay client-records
permission module key should stay client_records

That avoids dots and hyphens mixing badly inside permission keys.

Next best file after this is src/generated/permissions.js, which merges all these automatically