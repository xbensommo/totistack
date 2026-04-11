/**
 * @file src/features/auth/feature.manifest.js
 * @description Declarative authentication feature manifest.
 */

export default {
  id: 'auth',
  name: 'Authentication',
  version: '2.0.0',
  description: 'Firebase auth starter that integrates into the root access store.',
  dependencies: {
    features: [],
  },
  collections: ['users', 'sessions'],
};
