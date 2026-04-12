/**
 * @file router-helper.js
 * @description Shared enterprise router helpers and route guards for Totistack Vue projects.
 */
import { useHead } from '@unhead/vue'
import accessConfig from '@config/access.config.js'

const defaults = {
  appName: 'Totisoft Cc',
  sensitiveRoles: [],
  googleAnalyticsId: null,
  errorRoutes: (loader) => [
    {
      path: '/400',
      name: '400',
      component: loader('400'),
      props: (route) => ({
        code: '400',
        message: route.query.message,
        description: route.query.reason,
      }),
    },
    {
      path: '/401',
      name: '401',
      component: loader('401'),
      props: (route) => ({
        code: '401',
        message: route.query.message,
        description: route.query.reason,
      }),
    },
    {
      path: '/403',
      name: '403',
      component: loader('403'),
      props: (route) => ({
        code: '403',
        message: route.query.message,
        description: route.query.reason,
      }),
    },
    {
      path: '/500',
      name: '500',
      component: loader('500'),
      props: (route) => ({
        code: '500',
        message: route.query.message,
        description: route.query.reason,
      }),
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: loader('404'),
      props: {
        code: '404',
        message: 'Page Not Found',
      },
    },
  ],
}

/**
 * Create the final route list consumed by the router.
 *
 * @param {{
 *   routes?: any[],
 *   viewLoader?: ((view: string, dir?: string) => any) | null,
 *   settings?: Record<string, any>,
 * }} options
 * @returns {any[]}
 */
export function createEnterpriseRoutes({
  routes = [],
  viewLoader = null,
  settings = {},
}) {
  const config = { ...defaults, ...settings }
  const allRoutes = [...routes]

  if (viewLoader && config.errorRoutes) {
    allRoutes.push(...config.errorRoutes(viewLoader))
  }

  return allRoutes.flat()
}

/**
 * Determine whether the current route requires the access runtime to be ready.
 * Public routes without auth, guest, role, or permission requirements should
 * not trigger auth bootstrap.
 *
 * @param {any} to
 * @returns {boolean}
 */
function shouldPrepareAccessRuntime(to) {
  const requiresAuth = Boolean(to?.meta?.requiresAuth)
  const guestOnly = Boolean(to?.meta?.guestOnly || to?.meta?.guest)
  const requiredRoles = Array.isArray(to?.meta?.roles) ? to.meta.roles : []
  const requiredPermissions = Array.isArray(to?.meta?.permissions) ? to.meta.permissions : []

  return requiresAuth || guestOnly || requiredRoles.length > 0 || requiredPermissions.length > 0
}

/**
 * Resolve the current authenticated user from adapters or the store.
 *
 * @param {any} store
 * @param {Record<string, any>} adapters
 * @returns {any}
 */
function getResolvedCurrentUser(store, adapters) {
  return adapters.getCurrentUser ? adapters.getCurrentUser(store) : store.currentUser
}

/**
 * Evaluate route role access.
 *
 * @param {any} store
 * @param {Record<string, any>} adapters
 * @param {string[]} requiredRoles
 * @param {string | undefined} routeName
 * @returns {boolean}
 */
function isRoleAllowed(store, adapters, requiredRoles, routeName) {
  if (requiredRoles.length === 0) {
    return true
  }

  if (typeof adapters.checkRole === 'function') {
    return adapters.checkRole(store, requiredRoles, routeName)
  }

  if (typeof adapters.checkPermission === 'function') {
    return adapters.checkPermission(store, requiredRoles, routeName)
  }

  if (typeof store.hasAnyRole === 'function') {
    return store.hasAnyRole(requiredRoles)
  }

  if (typeof store.hasRole === 'function') {
    return requiredRoles.some((role) => store.hasRole(role))
  }

  return true
}

/**
 * Evaluate route permission access.
 *
 * @param {any} store
 * @param {string[]} requiredPermissions
 * @returns {boolean}
 */
function isPermissionAllowed(store, requiredPermissions) {
  if (requiredPermissions.length === 0) {
    return true
  }

  if (typeof store.hasPermission === 'function') {
    return requiredPermissions.every((permission) => store.hasPermission(permission))
  }

  return true
}

/**
 * Install the shared router guards.
 *
 * @param {any} router
 * @param {{
 *   useStore: () => any,
 *   settings?: Record<string, any>,
 *   adapters?: Record<string, any>,
 * }} options
 * @returns {any}
 */
export function installEnterpriseRouterGuards(
  router,
  {
    useStore,
    settings = {},
    adapters = {},
  },
) {
  const config = { ...defaults, ...settings }
  let navigationStartTime = 0

  router.beforeEach(async (to, from, next) => {
    navigationStartTime = Date.now()

    const store = useStore()

    if (adapters.loading) {
      adapters.loading(store, true)
    }

    const isInitialLoad = from.matched.length === 0
    const isSameRoute =
      !isInitialLoad &&
      to.path === from.path &&
      JSON.stringify(to.query) === JSON.stringify(from.query) &&
      to.hash === from.hash

    if (isSameRoute) {
      if (adapters.loading) {
        adapters.loading(store, false)
      }
      return next(false)
    }

    if (shouldPrepareAccessRuntime(to)) {
      if (typeof store.initAccessRuntime === 'function') {
        await store.initAccessRuntime()
      }

      if (typeof store.waitForAccessReady === 'function') {
        await store.waitForAccessReady()
      }
    }

    const requiresAuth = Boolean(to.meta?.requiresAuth)
    const guestOnly = Boolean(to.meta?.guestOnly || to.meta?.guest)
    const currentUser = getResolvedCurrentUser(store, adapters)
    const isAuthenticated = Boolean(currentUser)

    if (requiresAuth && !isAuthenticated) {
      if (adapters.loading) {
        adapters.loading(store, false)
      }

      return next({
        path: accessConfig?.routes?.login || '/auth',
        query: { redirect: to.fullPath },
      })
    }

    if (guestOnly && isAuthenticated) {
      if (adapters.loading) {
        adapters.loading(store, false)
      }

      return next(adapters.getDefaultDestination ? adapters.getDefaultDestination(store) : '/')
    }

    const shouldCheckRbac = Boolean(accessConfig?.rbac?.enabled)
    const requiredRoles = Array.isArray(to.meta?.roles) ? to.meta.roles : []
    const requiredPermissions = Array.isArray(to.meta?.permissions) ? to.meta.permissions : []

    if (shouldCheckRbac && (requiredRoles.length > 0 || requiredPermissions.length > 0)) {
      const roleAllowed = isRoleAllowed(store, adapters, requiredRoles, to.name)
      const permissionAllowed = isPermissionAllowed(store, requiredPermissions)

      if (!roleAllowed || !permissionAllowed) {
        if (adapters.loading) {
          adapters.loading(store, false)
        }
        return next(accessConfig?.routes?.forbidden || '/403')
      }
    }

    next()
  })

  router.afterEach((to) => {
    const store = useStore()

    if (adapters.loading) {
      adapters.loading(store, false)
    }

    const time = Date.now() - navigationStartTime
    if (time > 100 && import.meta.env.DEV) {
      console.debug(`[Perf] ${to.path}: ${time}ms`)
    }

    const rawTitle =
      to.meta?.title ||
      to.name?.toString().replace(/([A-Z])/g, ' $1').trim()

    const title = rawTitle
      ? `${rawTitle} | ${config.appName}`
      : config.appName

    useHead({ title })

    if (
      !import.meta.env.SSR &&
      window.gtag &&
      import.meta.env.PROD &&
      config.googleAnalyticsId
    ) {
      window.gtag('config', config.googleAnalyticsId, {
        page_path: to.fullPath,
        page_title: title,
      })
    }
  })

  router.onError((error) => {
    const store = useStore()

    if (adapters.loading) {
      adapters.loading(store, false)
    }

    if (
      !import.meta.env.SSR &&
      error?.message?.includes('Failed to fetch dynamically imported module')
    ) {
      if (!sessionStorage.getItem('router:chunk_error')) {
        sessionStorage.setItem('router:chunk_error', 'true')
        window.location.reload()
      }
    }
  })

  return router
}

/**
 * Create a lazy view helper that matches the project view folder contract.
 *
 * @param {(view: string, dir?: string) => any} pathResolver
 * @returns {(view: string, dir?: string) => () => any}
 */
export function createLazyHelper(pathResolver) {
  return (view, dir) => () => pathResolver(view, dir)
}
