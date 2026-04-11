/**
 * @file project.config.js
 * @description Main project configuration.
 */

export default {
  name: '{{projectName}}',
  version: '1.0.0',
  description: 'Generated with Totistack v2',

  frontend: 'vue',
  packageManager: 'npm',

  router: {
    mode: 'history',
    base: '/',
  },

  env: {
    development: {
      apiUrl: 'http://localhost:3000',
      debug: true,
    },
    production: {
      apiUrl: 'https://api.{{projectName}}.com',
      debug: false,
    },
  },

  providers: {
    firebase: {
      apiKey: '{{firebaseApiKey}}',
      authDomain: '{{firebaseProjectId}}.firebaseapp.com',
      projectId: '{{firebaseProjectId}}',
      storageBucket: '{{firebaseProjectId}}.appspot.com',
      messagingSenderId: '{{firebaseMessagingSenderId}}',
      appId: '{{firebaseAppId}}',
    },
    firestore: {
      useShardProvider: true,
      shardProviderVersion: '^2.2.3',
    },
  },

  security: {
    authEnabled: {{authEnabled}},
    rbacEnabled: {{rbacEnabled}},
  },

  modules: {
    apps: {{appsList}},
    features: {{featuresList}},
  },
};
