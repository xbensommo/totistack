/** @file auth/index.js*/
import { defineFeatureContract } from '../../core/contracts/feature.contract.js';
/**
 * Authentication feature.
 */
export default defineFeatureContract({
  id: 'auth',
  name: 'auth',
  collections: ["users", "sessions"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});
