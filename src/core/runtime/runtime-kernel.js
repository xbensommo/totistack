/**
 * @file src/core/runtime/runtime-kernel.js
 * @description Bootstraps runtime apps and features into the active Vue app.
 */

import { loadApps } from './app-loader.js'
import { loadFeatures } from './feature-loader.js'
import { registerRoutes } from './registerRoutes.js'
import { registerStores } from './registerStore.js'

/**
 * Resolve the active Vue Router instance from the Vue app.
 *
 * @param {object} app
 * @returns {object|null}
 */
function resolveRouter(app) {
  return (
    app?.config?.globalProperties?.$router ||
    app?._context?.config?.globalProperties?.$router ||
    app?._instance?.appContext?.config?.globalProperties?.$router ||
    app?._context?.provides?.router ||
    null
  )
}

/**
 * Resolve the active Pinia instance from the Vue app.
 *
 * @param {object} app
 * @returns {object|null}
 */
function resolvePinia(app) {
  return (
    app?.config?.globalProperties?.$pinia ||
    app?._context?.provides?.pinia ||
    app?._instance?.appContext?.provides?.pinia ||
    null
  )
}

/**
 * Bootstrap the runtime by loading apps and features, then registering
 * their routes and stores when the required platform instances exist.
 *
 * @param {object} app
 * @param {{ router?: object, pinia?: object }} [options={}]
 * @returns {Promise<{apps: Array<object>, features: Array<object>, modules: Array<object>, router: object|null, pinia: object|null}>}
 */
export async function bootstrapApp(app, options = {}) {
  const apps = await loadApps()
  const features = await loadFeatures()
  const modules = [...apps, ...features].filter(Boolean)

  const router = options.router || resolveRouter(app)
  const pinia = options.pinia || resolvePinia(app)

  if (router) {
    await registerRoutes(router, modules)
  }

  if (pinia) {
    await registerStores(pinia, modules)
  }

  return {
    apps,
    features,
    modules,
    router,
    pinia,
  }
}
