/**
 * @file src/examples/usage.main.js
 * @description Example of how to install the action pipeline in main.js.
 */

import { createApp } from 'vue';
import App from '@/App.vue';
import { installActionPipeline } from '../core/plugins/action-plugin.js'; 
import { createAuthActionDefinitions } from './auth/auth.actions.js';
import { createCrmActionDefinitions } from './crm/crm.actions.js';

const app = createApp(App);

installActionPipeline(app, {
  actions: [
    ...createAuthActionDefinitions(),
    ...createCrmActionDefinitions(),
  ],
  normalizeError(error) {
    return error instanceof Error ? error : new Error('Action failed.');
  },
});

app.mount('#app');
