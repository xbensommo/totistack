import fs from 'fs'
import path from 'path'

const features = [
  {
    path: 'src/features/forms/index.js',
    content: `export default {
  name: 'forms',
  title: 'Forms Engine',
  description: 'Reusable forms for enquiries, onboarding, and lead capture.',
  category: 'business',
  dependencies: [],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/forms');
    await ctx.writeFile(
      'src/modules/forms/index.js',
      \`export const formsModule = {
  enabled: true,
  version: 1,
};
\`
    );

    await ctx.addEnv([
      'VITE_FORMS_ENABLED=true',
    ]);
  },
};`
  },
  {
    path: 'src/features/cms/index.js',
    content: `export default {
  name: 'cms',
  title: 'Content Management',
  description: 'Content management foundation for editable pages, sections, and publishing.',
  category: 'content',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/cms');
    await ctx.writeFile(
      'src/modules/cms/index.js',
      \`export const cmsModule = {
  enabled: true,
  collections: ['pages', 'posts'],
};
\`
    );

    await ctx.addEnv([
      'VITE_CMS_ENABLED=true',
    ]);
  },
};`
  },
  {
    path: 'src/features/payments/index.js',
    content: `export default {
  name: 'payments',
  title: 'Payments',
  description: 'Payment integration foundation for online checkout, invoices, and billing.',
  category: 'commerce',
  dependencies: ['auth'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/payments');
    await ctx.writeFile(
      'src/modules/payments/index.js',
      \`export const paymentsModule = {
  enabled: true,
  providers: [],
};
\`
    );

    await ctx.addEnv([
      'VITE_PAYMENTS_ENABLED=true',
    ]);
  },
};`
  },
  {
    path: 'src/features/crm/index.js',
    content: `export default {
  name: 'crm',
  title: 'CRM',
  description: 'Customer and lead management foundation for internal teams.',
  category: 'business',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications', 'forms'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/crm');
    await ctx.writeFile(
      'src/modules/crm/index.js',
      \`export const crmModule = {
  enabled: true,
  entities: ['leads', 'clients', 'activities'],
};
\`
    );

    await ctx.addEnv([
      'VITE_CRM_ENABLED=true',
    ]);
  },
};`
  },
  {
    path: 'src/features/catalog/index.js',
    content: `export default {
  name: 'catalog',
  title: 'Product Catalog',
  description: 'Catalog foundation for products, categories, pricing, and listings.',
  category: 'commerce',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/catalog');
    await ctx.writeFile(
      'src/modules/catalog/index.js',
      \`export const catalogModule = {
  enabled: true,
  version: 1,
};
\`
    );

    await ctx.addEnv([
      'VITE_CATALOG_ENABLED=true',
    ]);
  },
};`
  },
  {
    path: 'src/features/client-records/index.js',
    content: `export default {
  name: 'client-records',
  title: 'Client Records',
  description: 'Protected client record storage and access patterns.',
  category: 'operations',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/client-records');
    await ctx.writeFile(
      'src/modules/client-records/index.js',
      \`export const clientRecordsModule = {
  enabled: true,
  secure: true,
};
\`
    );

    await ctx.addEnv([
      'VITE_CLIENT_RECORDS_ENABLED=true',
    ]);
  },
};`
  },
  {
    path: 'src/features/messaging/index.js',
    content: `export default {
  name: 'messaging',
  title: 'Messaging',
  description: 'Messaging hooks for email, WhatsApp, and customer communication flows.',
  category: 'communication',
  dependencies: [],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/messaging');
    await ctx.writeFile(
      'src/modules/messaging/index.js',
      \`export const messagingModule = {
  enabled: true,
  channels: ['email', 'whatsapp'],
};
\`
    );

    await ctx.addEnv([
      'VITE_MESSAGING_ENABLED=true',
    ]);
  },
};`
  }
];

function initializeFeatures() {
  console.log('🚀 Starting feature generation...');

  features.forEach(feature => {
    const dir = path.dirname(feature.path);

    // Create directory recursively
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    // Write the file
    fs.writeFileSync(feature.path, feature.content, 'utf8');
    console.log(`✅ Created: ${feature.path}`);
  });

  console.log('\\n✨ All features generated successfully!');
}

initializeFeatures();