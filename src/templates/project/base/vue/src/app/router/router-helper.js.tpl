/** @file router-helper.js */
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

    if (typeof store.initAccessRuntime === 'function') {
      await store.initAccessRuntime()
    }

    if (typeof store.waitForAccessReady === 'function') {
      await store.waitForAccessReady()
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

    const requiresAuth = Boolean(to.meta?.requiresAuth)
    const guestOnly = Boolean(to.meta?.guestOnly || to.meta?.guest)
    const currentUser = adapters.getCurrentUser ? adapters.getCurrentUser(store) : store.currentUser
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
      const roleAllowed = requiredRoles.length === 0 || (adapters.checkPermission
        ? adapters.checkPermission(store, requiredRoles, to.name)
        : true)

      const permissionAllowed = requiredPermissions.length === 0 || requiredPermissions.every((permission) => {
        if (typeof store.hasPermission === 'function') {
          return store.hasPermission(permission)
        }
        return true
      })

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

export function createLazyHelper(pathResolver) {
  return (view, dir) => () => pathResolver(view, dir)
}
