/**
 * @file app/provider/provider.js
 * @description Root provider registration for the generated project.
 */

import { auth, db, functions, storage } from '@app/firebase/index.js'
import shardProvider from './shard-provider.js'
import { permissionDirective } from '@app/directives/permission.js'

export const rootProviders = {
  auth,
  db,
  functions,
  storage,
  shardProvider,
}

/**
 * Register root providers on the Vue application instance.
 *
 * @param {import('vue').App} app
 * @returns {void}
 */
export function registerRootProviders(app) {
  app.provide('auth', auth)
  app.provide('db', db)
  app.provide('functions', functions)
  app.provide('storage', storage)
  app.provide('shardProvider', shardProvider)

  // Useful for Options API / legacy access if needed

  app.directive('can', permissionDirective)
}

export default rootProviders