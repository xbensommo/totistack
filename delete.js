import fs from 'fs/promises';
import path from 'path';

const files = [
  // ==========================================
  // 1) FEATURES
  // ==========================================
  {
    path: 'src/features/booking/index.js',
    content: `/**
 * @file booking/index.js
 * @description Provider-aware booking feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/booking');

function getVariantTemplateDir(visibility) {
  return path.join(TEMPLATE_ROOT, visibility);
}

export default {
  name: 'booking',
  title: 'Booking System',
  description: 'Appointments, scheduling, and booking workflows.',
  category: 'platform',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications', 'whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'visibility',
      type: 'list',
      message: 'Should the booking system be public or private?',
      choices: [
        { name: 'Public booking page', value: 'public' },
        { name: 'Private/internal booking only', value: 'private' },
      ],
      default: 'public',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('booking');
    const visibility = config.visibility || 'public';
    const templateDir = getVariantTemplateDir(visibility);

    ctx.log(\`Using booking visibility: \${visibility}\`);

    await ctx.ensureDir('src/modules/booking');

    await ctx.copyTemplate(templateDir, 'src/modules/booking', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        bookingVisibility: visibility,
      },
    });

    await ctx.writeFile(
      'src/modules/booking/index.js',
      \`export { bookingModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_BOOKING_ENABLED=true',
      \`VITE_BOOKING_VISIBILITY=\${visibility}\`,
    ]);

    await ctx.addDependencies(['date-fns']);
  },
};`
  },
  {
    path: 'src/features/catalog/index.js',
    content: `/**
 * @file catalog/index.js
 * @description Product catalog feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/catalog');

function getVariantTemplateDir(mode) {
  return path.join(TEMPLATE_ROOT, mode);
}

export default {
  name: 'catalog',
  title: 'Product Catalog',
  description: 'Catalog foundation for products, categories, pricing, and listings.',
  category: 'commerce',
  dependencies: [],
  optionalDependencies: ['forms'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'mode',
      type: 'list',
      message: 'Choose catalog type',
      choices: [
        { name: 'Simple product catalog', value: 'simple' },
        { name: 'Inventory-aware catalog', value: 'inventory' },
      ],
      default: 'simple',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('catalog');
    const mode = config.mode || 'simple';
    const templateDir = getVariantTemplateDir(mode);

    await ctx.ensureDir('src/modules/catalog');

    await ctx.copyTemplate(templateDir, 'src/modules/catalog', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        catalogMode: mode,
      },
    });

    await ctx.writeFile(
      'src/modules/catalog/index.js',
      \`export { catalogModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CATALOG_ENABLED=true',
      \`VITE_CATALOG_MODE=\${mode}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/client-records/index.js',
    content: `/**
 * @file client-records/index.js
 * @description Client records feature for protected records and access control.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/client-records');

function getVariantTemplateDir(scope) {
  return path.join(TEMPLATE_ROOT, scope);
}

export default {
  name: 'client-records',
  title: 'Client Records',
  description: 'Protected client record storage and access patterns.',
  category: 'operations',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'scope',
      type: 'list',
      message: 'Choose client records access scope',
      choices: [
        { name: 'Internal staff only', value: 'internal' },
        { name: 'Shared staff and client access', value: 'shared' },
      ],
      default: 'internal',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('client-records');
    const scope = config.scope || 'internal';
    const templateDir = getVariantTemplateDir(scope);

    await ctx.ensureDir('src/modules/client-records');

    await ctx.copyTemplate(templateDir, 'src/modules/client-records', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        clientRecordsScope: scope,
      },
    });

    await ctx.writeFile(
      'src/modules/client-records/index.js',
      \`export { clientRecordsModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CLIENT_RECORDS_ENABLED=true',
      \`VITE_CLIENT_RECORDS_SCOPE=\${scope}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/cms/index.js',
    content: `/**
 * @file cms/index.js
 * @description CMS feature for editable content and publishing workflows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/cms');

function getVariantTemplateDir(mode) {
  return path.join(TEMPLATE_ROOT, mode);
}

export default {
  name: 'cms',
  title: 'Content Management',
  description: 'Content management foundation for editable pages, sections, and publishing.',
  category: 'content',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'mode',
      type: 'list',
      message: 'Choose CMS mode',
      choices: [
        { name: 'Pages only', value: 'pages' },
        { name: 'Pages and blog posts', value: 'blog' },
      ],
      default: 'pages',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('cms');
    const mode = config.mode || 'pages';
    const templateDir = getVariantTemplateDir(mode);

    await ctx.ensureDir('src/modules/cms');

    await ctx.copyTemplate(templateDir, 'src/modules/cms', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        cmsMode: mode,
      },
    });

    await ctx.writeFile(
      'src/modules/cms/index.js',
      \`export { cmsModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CMS_ENABLED=true',
      \`VITE_CMS_MODE=\${mode}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/crm/index.js',
    content: `/**
 * @file crm/index.js
 * @description CRM feature for leads, clients, and pipeline management.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/crm');

function getVariantTemplateDir(type) {
  return path.join(TEMPLATE_ROOT, type);
}

export default {
  name: 'crm',
  title: 'CRM',
  description: 'Customer and lead management foundation for internal teams.',
  category: 'business',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['forms', 'notifications', 'whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'type',
      type: 'list',
      message: 'Choose CRM type',
      choices: [
        { name: 'Lead pipeline CRM', value: 'pipeline' },
        { name: 'Client relationship CRM', value: 'client-management' },
      ],
      default: 'pipeline',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('crm');
    const type = config.type || 'pipeline';
    const templateDir = getVariantTemplateDir(type);

    await ctx.ensureDir('src/modules/crm');

    await ctx.copyTemplate(templateDir, 'src/modules/crm', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        crmType: type,
      },
    });

    await ctx.writeFile(
      'src/modules/crm/index.js',
      \`export { crmModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CRM_ENABLED=true',
      \`VITE_CRM_TYPE=\${type}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/dashboard/index.js',
    content: `/**
 * @file dashboard/index.js
 * @description Dashboard feature for internal admin and staff experiences.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/dashboard');

function getVariantTemplateDir(layout) {
  return path.join(TEMPLATE_ROOT, layout);
}

export default {
  name: 'dashboard',
  title: 'Dashboard',
  description: 'Protected internal dashboard shell.',
  category: 'platform',
  dependencies: ['auth'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'layout',
      type: 'list',
      message: 'Choose dashboard layout style',
      choices: [
        { name: 'Sidebar dashboard', value: 'sidebar' },
        { name: 'Top navigation dashboard', value: 'topbar' },
      ],
      default: 'sidebar',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('dashboard');
    const layout = config.layout || 'sidebar';
    const templateDir = getVariantTemplateDir(layout);

    await ctx.ensureDir('src/modules/dashboard');

    await ctx.copyTemplate(templateDir, 'src/modules/dashboard', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        dashboardLayout: layout,
      },
    });

    await ctx.writeFile(
      'src/modules/dashboard/index.js',
      \`export { dashboardModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_DASHBOARD_ENABLED=true',
      \`VITE_DASHBOARD_LAYOUT=\${layout}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/forms/index.js',
    content: `/**
 * @file forms/index.js
 * @description Forms feature for lead capture, onboarding, and custom workflows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/forms');

function getVariantTemplateDir(purpose) {
  return path.join(TEMPLATE_ROOT, purpose);
}

export default {
  name: 'forms',
  title: 'Forms Engine',
  description: 'Reusable forms for enquiries, onboarding, and lead capture.',
  category: 'business',
  dependencies: [],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'purpose',
      type: 'list',
      message: 'Choose forms purpose',
      choices: [
        { name: 'Lead capture forms', value: 'lead-capture' },
        { name: 'Onboarding forms', value: 'onboarding' },
      ],
      default: 'lead-capture',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('forms');
    const purpose = config.purpose || 'lead-capture';
    const templateDir = getVariantTemplateDir(purpose);

    await ctx.ensureDir('src/modules/forms');

    await ctx.copyTemplate(templateDir, 'src/modules/forms', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        formsPurpose: purpose,
      },
    });

    await ctx.writeFile(
      'src/modules/forms/index.js',
      \`export { formsModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_FORMS_ENABLED=true',
      \`VITE_FORMS_PURPOSE=\${purpose}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/messaging/index.js',
    content: `/**
 * @file messaging/index.js
 * @description Messaging feature for communication channels and customer conversation flows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/messaging');

function getVariantTemplateDir(mode) {
  return path.join(TEMPLATE_ROOT, mode);
}

export default {
  name: 'messaging',
  title: 'Messaging',
  description: 'Messaging hooks for email, WhatsApp, and customer communication flows.',
  category: 'communication',
  dependencies: [],
  optionalDependencies: ['whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'mode',
      type: 'list',
      message: 'Choose messaging mode',
      choices: [
        { name: 'Internal notifications', value: 'internal' },
        { name: 'Customer conversations', value: 'customer' },
      ],
      default: 'customer',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('messaging');
    const mode = config.mode || 'customer';
    const templateDir = getVariantTemplateDir(mode);

    await ctx.ensureDir('src/modules/messaging');

    await ctx.copyTemplate(templateDir, 'src/modules/messaging', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        messagingMode: mode,
      },
    });

    await ctx.writeFile(
      'src/modules/messaging/index.js',
      \`export { messagingModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_MESSAGING_ENABLED=true',
      \`VITE_MESSAGING_MODE=\${mode}\`,
    ]);
  },
};`
  },
  {
    path: 'src/features/notifications/index.js',
    content: `/**
 * @file notifications/index.js
 * @description Notifications feature for email, WhatsApp, FCM, and in-app channels.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { pathExists } from '../../core/template-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/notifications');

function getDependencyList(channels) {
  const deps = [];

  if (channels.includes('fcm')) deps.push('firebase');
  if (channels.includes('email')) deps.push('nodemailer');

  return deps;
}

export default {
  name: 'notifications',
  title: 'Notifications',
  description: 'Email, WhatsApp, FCM, and in-app notification foundation.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: ['whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'channels',
      type: 'checkbox',
      message: 'Select notification channels',
      choices: [
        { name: 'Email', value: 'email' },
        { name: 'WhatsApp', value: 'whatsapp' },
        { name: 'Firebase Cloud Messaging (FCM)', value: 'fcm' },
        { name: 'In-app notifications', value: 'in-app' },
      ],
      default: ['email'],
      validate(value) {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Select at least one notification channel.';
        }
        return true;
      },
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('notifications');
    const channels = Array.isArray(config.channels) && config.channels.length
      ? config.channels
      : ['email'];

    await ctx.ensureDir('src/modules/notifications');

    for (const channel of channels) {
      const channelDir = path.join(TEMPLATE_ROOT, channel);
      if (!(await pathExists(channelDir))) continue;

      await ctx.copyTemplate(channelDir, 'src/modules/notifications', {
        variables: {
          projectName: ctx.manifest.name || 'toti-app',
          notificationChannel: channel,
          notificationChannels: channels.join(','),
        },
      });
    }

    const exports = channels.map((channel) => {
      const safeName = channel.replace(/[^a-z0-9]/gi, '-');
      return \`export * from './\${safeName}.js';\`;
    }).join('\\n');

    await ctx.writeFile(
      'src/modules/notifications/index.js',
      \`\${exports}\\n\`,
      { overwrite: true }
    );

    await ctx.writeFile(
      'src/modules/notifications/module.js',
      \`export const notificationsModule = {
  enabled: true,
  channels: \${JSON.stringify(channels, null, 2)},
};
\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_NOTIFICATIONS_ENABLED=true',
      \`VITE_NOTIFICATION_CHANNELS=\${channels.join(',')}\`,
    ]);

    await ctx.addDependencies(getDependencyList(channels));
  },
};`
  },
  {
    path: 'src/features/payments/index.js',
    content: `/**
 * @file payments/index.js
 * @description Payments feature for checkout, invoices, and billing flows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/payments');

function getVariantTemplateDir(provider) {
  return path.join(TEMPLATE_ROOT, provider);
}

function getProviderDependencies(provider) {
  switch (provider) {
    case 'stripe':
      return ['stripe'];
    case 'payfast':
      return [];
    case 'manual':
      return [];
    default:
      return [];
  }
}

export default {
  name: 'payments',
  title: 'Payments',
  description: 'Payment integration foundation for online checkout, invoices, and billing.',
  category: 'commerce',
  dependencies: ['auth'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'provider',
      type: 'list',
      message: 'Choose a payment provider',
      choices: [
        { name: 'Stripe', value: 'stripe' },
        { name: 'PayFast / manual regional flow', value: 'payfast' },
        { name: 'Manual payments', value: 'manual' },
      ],
      default: 'manual',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('payments');
    const provider = config.provider || 'manual';
    const templateDir = getVariantTemplateDir(provider);

    await ctx.ensureDir('src/modules/payments');

    await ctx.copyTemplate(templateDir, 'src/modules/payments', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        paymentsProvider: provider,
      },
    });

    await ctx.writeFile(
      'src/modules/payments/index.js',
      \`export { paymentsModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_PAYMENTS_ENABLED=true',
      \`VITE_PAYMENTS_PROVIDER=\${provider}\`,
    ]);

    await ctx.addDependencies(getProviderDependencies(provider));
  },
};`
  },
  {
    path: 'src/features/whatsapp/index.js',
    content: `/**
 * @file whatsapp/index.js
 * @description WhatsApp integration feature for cloud API and messaging workflows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/whatsapp');

function getVariantTemplateDir(provider) {
  return path.join(TEMPLATE_ROOT, provider);
}

export default {
  name: 'whatsapp',
  title: 'WhatsApp Integration',
  description: 'WhatsApp integration hooks for cloud API, templates, and messaging flows.',
  category: 'communication',
  dependencies: [],
  optionalDependencies: ['messaging', 'notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'provider',
      type: 'list',
      message: 'Choose WhatsApp integration type',
      choices: [
        { name: 'WhatsApp Cloud API', value: 'cloud-api' },
        { name: 'Webhook placeholder only', value: 'webhook' },
      ],
      default: 'cloud-api',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('whatsapp');
    const provider = config.provider || 'cloud-api';
    const templateDir = getVariantTemplateDir(provider);

    await ctx.ensureDir('src/modules/whatsapp');

    await ctx.copyTemplate(templateDir, 'src/modules/whatsapp', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        whatsappProvider: provider,
      },
    });

    await ctx.writeFile(
      'src/modules/whatsapp/index.js',
      \`export { whatsappModule } from './module.js';\\n\`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_WHATSAPP_ENABLED=true',
      \`VITE_WHATSAPP_PROVIDER=\${provider}\`,
    ]);
  },
};`
  },

  // ==========================================
  // 2) TEMPLATES
  // ==========================================
  
  // Booking
  {
    path: 'src/templates/features/booking/public/module.js.txt',
    content: `/**
 * @file module.js
 * @description Public booking module.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export const bookingModule = {
  enabled: true,
  visibility: 'public',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/booking/private/module.js.txt',
    content: `/**
 * @file module.js
 * @description Private booking module.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export const bookingModule = {
  enabled: true,
  visibility: 'private',
  projectName: '{{projectName}}',
};`
  },

  // Catalog
  {
    path: 'src/templates/features/catalog/simple/module.js.txt',
    content: `export const catalogModule = {
  enabled: true,
  mode: 'simple',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/catalog/inventory/module.js.txt',
    content: `export const catalogModule = {
  enabled: true,
  mode: 'inventory',
  projectName: '{{projectName}}',
};`
  },

  // Client Records
  {
    path: 'src/templates/features/client-records/internal/module.js.txt',
    content: `export const clientRecordsModule = {
  enabled: true,
  scope: 'internal',
  secure: true,
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/client-records/shared/module.js.txt',
    content: `export const clientRecordsModule = {
  enabled: true,
  scope: 'shared',
  secure: true,
  projectName: '{{projectName}}',
};`
  },

  // CMS
  {
    path: 'src/templates/features/cms/pages/module.js.txt',
    content: `export const cmsModule = {
  enabled: true,
  mode: 'pages',
  collections: ['pages'],
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/cms/blog/module.js.txt',
    content: `export const cmsModule = {
  enabled: true,
  mode: 'blog',
  collections: ['pages', 'posts'],
  projectName: '{{projectName}}',
};`
  },

  // CRM
  {
    path: 'src/templates/features/crm/pipeline/module.js.txt',
    content: `export const crmModule = {
  enabled: true,
  type: 'pipeline',
  entities: ['leads', 'stages', 'activities'],
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/crm/client-management/module.js.txt',
    content: `export const crmModule = {
  enabled: true,
  type: 'client-management',
  entities: ['clients', 'accounts', 'activities'],
  projectName: '{{projectName}}',
};`
  },

  // Dashboard
  {
    path: 'src/templates/features/dashboard/sidebar/module.js.txt',
    content: `export const dashboardModule = {
  enabled: true,
  layout: 'sidebar',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/dashboard/topbar/module.js.txt',
    content: `export const dashboardModule = {
  enabled: true,
  layout: 'topbar',
  projectName: '{{projectName}}',
};`
  },

  // Forms
  {
    path: 'src/templates/features/forms/lead-capture/module.js.txt',
    content: `export const formsModule = {
  enabled: true,
  purpose: 'lead-capture',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/forms/onboarding/module.js.txt',
    content: `export const formsModule = {
  enabled: true,
  purpose: 'onboarding',
  projectName: '{{projectName}}',
};`
  },

  // Messaging
  {
    path: 'src/templates/features/messaging/internal/module.js.txt',
    content: `export const messagingModule = {
  enabled: true,
  mode: 'internal',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/messaging/customer/module.js.txt',
    content: `export const messagingModule = {
  enabled: true,
  mode: 'customer',
  projectName: '{{projectName}}',
};`
  },

  // Notifications
  {
    path: 'src/templates/features/notifications/email/email.js.txt',
    content: `export const emailNotificationChannel = {
  enabled: true,
  channel: 'email',
};`
  },
  {
    path: 'src/templates/features/notifications/whatsapp/whatsapp.js.txt',
    content: `export const whatsappNotificationChannel = {
  enabled: true,
  channel: 'whatsapp',
};`
  },
  {
    path: 'src/templates/features/notifications/fcm/fcm.js.txt',
    content: `export const fcmNotificationChannel = {
  enabled: true,
  channel: 'fcm',
};`
  },
  {
    path: 'src/templates/features/notifications/in-app/in-app.js.txt',
    content: `export const inAppNotificationChannel = {
  enabled: true,
  channel: 'in-app',
};`
  },

  // Payments
  {
    path: 'src/templates/features/payments/stripe/module.js.txt',
    content: `export const paymentsModule = {
  enabled: true,
  provider: 'stripe',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/payments/payfast/module.js.txt',
    content: `export const paymentsModule = {
  enabled: true,
  provider: 'payfast',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/payments/manual/module.js.txt',
    content: `export const paymentsModule = {
  enabled: true,
  provider: 'manual',
  projectName: '{{projectName}}',
};`
  },

  // WhatsApp
  {
    path: 'src/templates/features/whatsapp/cloud-api/module.js.txt',
    content: `export const whatsappModule = {
  enabled: true,
  provider: 'cloud-api',
  projectName: '{{projectName}}',
};`
  },
  {
    path: 'src/templates/features/whatsapp/webhook/module.js.txt',
    content: `export const whatsappModule = {
  enabled: true,
  provider: 'webhook',
  projectName: '{{projectName}}',
};`
  }
];

async function generateStructure() {
  console.log('🚀 Starting generation script...\n');
  
  try {
    for (const file of files) {
      // Resolve absolute path
      const fullPath = path.resolve(process.cwd(), file.path);
      
      // Get directory path
      const dirPath = path.dirname(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });
      
      // Write file (automatically overwrites if exists)
      await fs.writeFile(fullPath, file.content, 'utf8');
      
      console.log(`✅ Created: ${file.path}`);
    }
    
    console.log('\\n🎉 All files generated successfully!');
  } catch (error) {
    console.error('\\n❌ Error generating files:', error.message);
    process.exit(1);
  }
}

// Run the script
generateStructure();