/**
 * @file src/features/database-manager/index.js
 * @description Database manager feature contract.
 */

import DatabaseManagerService from './database-manager-service.js'
import { defineFeatureContract } from '../../core/contracts/feature.contract.js'

export default defineFeatureContract({
  id: 'database-manager',
  name: 'database-manager',
  /**
   * Install the database-manager feature into the active Vue app.
   *
   * @param {import('vue').App} app
   * @param {Record<string, unknown>} [config={}]
   */
  install(app, config = {}) {
    const service = new DatabaseManagerService(config)
    app.provide('databaseManagerService', service)
  },
})
