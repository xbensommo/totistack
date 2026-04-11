/**
 * @file app/router/router.index.js
 * @description Minimal root router wiring.
 *
 * The router consumes only core routes plus the generated route assembly.
 */

import { useAppStore } from '@app/stores/appStore/index.js';
import { createEnterpriseRoutes, createLazyHelper, installEnterpriseRouterGuards } from './router-helper.js';
import { publicRoutes } from './routes/publicRoutes.js';
import { createGeneratedRoutes } from '@generated/routes.js';

/**
 * Standardised lazy view loader.
 */
const lazy = createLazyHelper((view, dir) => {
  return dir
    ? import(`@app/views/${dir}/${view}.vue`)
    : import(`@app/views/${view}.vue`)
})

/**
 * Final route list for the application.
 */
export const routes = createEnterpriseRoutes({
  routes: [
    publicRoutes(lazy),
    ...createGeneratedRoutes({ lazy }),
  ],
  viewLoader: (name) => lazy(name, 'errors'),
  settings: {
    appName: '{{appName}}',
  },
})

/**
 * Install router guards.
 *
 * @param {import('vue-router').Router} router
 * @returns {void}
 */
export function installRouterGuards(router) {
  installEnterpriseRouterGuards(router, {
    useStore: useAppStore,
    settings: {
      appName: '{{appName}}',
      googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID,
      sensitiveRoles: ['admin', 'manager'],
    },
    adapters: {
      loading: (store, isLoading) => {
        if (isLoading) store.showLoading()
        else store.hideLoading()
      },
      getAuthInitialized: (store) => store.authInitialized,
      getCurrentUser: (store) => store.currentUser,
      roleKey: 'roles',
      getDefaultDestination: () => '/',
      checkPermission: (store, requiredRoles, routeName) => store.checkPermission(requiredRoles, routeName),
      checkClaim: (store, claim) => Boolean(store.claims?.[claim]),
      refreshClaims: (store) => store.refreshUserClaims(),
    },
  })
}
