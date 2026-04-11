/**
 * @file firestore-provider.factory.js
 * @description Factory for Firestore provider.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { setupShardProvider } from './shard-provider.adapter.js';
import { logger } from '../../utils/index.js';

/**
 * Create a Firestore provider instance.
 * @param {object} firebaseApp - Firebase app.
 * @param {object} config - Firestore config.
 * @returns {object}
 */
export function createFirestoreProvider(firebaseApp, config) {
  logger.info('Creating Firestore provider');
  return setupShardProvider(firebaseApp, config);
}