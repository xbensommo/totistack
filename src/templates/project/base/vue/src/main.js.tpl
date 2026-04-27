/**
 * @file main.js
 * @description Application entry point.
 * @date {{currentDate}}
 */

import { ViteSSG } from 'vite-ssg';
import { createPinia } from 'pinia';
import App from './App.vue';
import { routes, installRouterGuards, scrollBehavior } from './app/router/index.js';
import { registerRootProviders } from './app/provider/provider.js';
import { bootstrapApp } from './app/boot/bootstrap.js';

import { installActionPipeline } from '@action_modal/plugins/action-plugin.js'; 

import { createAuthActionDefinitions } from '@features/auth/auth.actions.js';
/*import { createCrmActionDefinitions } from './crm/crm.actions.js';*/

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'vue-sonner/style.css';
import '@/assets/css/main.css'

/**
 * Vite SSG application factory.
 */
export const createApp = ViteSSG(App, { routes, scrollBehavior }, async ({ app, router }) => {
  const pinia = createPinia();
  app.use(pinia);

  registerRootProviders(app);
  installRouterGuards(router);
  await bootstrapApp();

  app.config.errorHandler = () => {
    if (!import.meta.env.SSR) {
      router.push({
        name: '500',
        query: {
          message: 'Application Crash',
          reason: 'A critical rendering error occurred.',
        },
      });
    }
  };

  if (!import.meta.env.SSR) {
    window.addEventListener('unhandledrejection', () => {
      router.push({
        name: '500',
        query: {
          message: 'Server Error',
          reason: 'Our systems are experiencing a technical issue.',
        },
      });
    });
  };

  installActionPipeline(app, {
    actions: [
      ...createAuthActionDefinitions(),
      // ...createCrmActionDefinitions(),
    ],
    normalizeError(error) {
      return error instanceof Error ? error : new Error('Action failed.');
    },
  });
});
