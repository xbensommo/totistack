import { computed, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/auth-store.js'

function resolveAuthService(injected) {
  return injected || globalThis.__TOTISTACK_AUTH_SERVICE__ || null
}

export function useAuth() {
  const injectedAuthService = inject('authService', null)
  const authService = resolveAuthService(injectedAuthService)
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const actionLoading = ref(false)

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const loading = computed(() => authStore.loading || actionLoading.value)
  const userRoles = computed(() => authStore.userRoles)
  const userPermissions = computed(() => authStore.userPermissions)
  const isAdmin = computed(() => authStore.isAdmin)
  const isPrivileged = computed(() => authStore.isPrivileged)

  async function syncCurrentUser() {
    const access = typeof authService?.getCurrentAccess === 'function'
      ? authService.getCurrentAccess()
      : null

    if (access) {
      authStore.syncFromAccess(access)
      return access
    }

    const firebaseUser = authService?.auth?.currentUser || authService?.currentUser || null
    if (firebaseUser && typeof authService?.syncAuthenticatedUser === 'function') {
      const profile = await authService.syncAuthenticatedUser(firebaseUser)
      authStore.syncFromAccess(profile)
      return profile
    }

    if (!firebaseUser) {
      authStore.clearUser()
      return null
    }

    authStore.syncFromAccess(firebaseUser)
    return firebaseUser
  }

  async function run(action, errorMessage, ...args) {
    if (!authService || typeof authService[action] !== 'function') {
      throw new Error(`Auth service action is not available: ${action}`)
    }

    actionLoading.value = true
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authService[action](...args)
      await syncCurrentUser()
      return result
    } catch (error) {
      authStore.setError(error)
      throw error
    } finally {
      actionLoading.value = false
      authStore.setLoading(false)
    }
  }

  const login = (email, password) => run('login', 'Unable to sign in.', email, password)
  const register = (email, password, profileData = {}) => run('signUp', 'Unable to create account.', email, password, profileData)
  const loginWithProvider = (provider) => run('loginWithSocial', 'Unable to sign in.', provider)
  const registerWithProvider = (provider) => run('loginWithSocial', 'Unable to create account.', provider)
  const logout = () => run('logout', 'Unable to sign out.')
  const sendPasswordReset = (email) => run('sendPasswordReset', 'Unable to send password reset.', email)
  const resetPassword = (code, newPassword) => run('resetPassword', 'Unable to reset password.', code, newPassword)
  const updateUserProfile = (profileData) => run('updateProfile', 'Unable to update profile.', profileData)
  const changeUserPassword = (currentPassword, newPassword) => run('changePassword', 'Unable to change password.', currentPassword, newPassword)

  function hasRole(role) {
    return authStore.hasRole(role)
  }

  function hasAnyRole(roles = []) {
    return authStore.hasAnyRole(roles)
  }

  function hasAllRoles(roles = []) {
    return roles.every((role) => authStore.hasRole(role))
  }

  function hasPermission(permission) {
    return authStore.hasPermission(permission)
  }

  function hasAnyPermission(permissions = []) {
    return authStore.hasAnyPermission(permissions)
  }

  function hasAllPermissions(permissions = []) {
    return authStore.hasAllPermissions(permissions)
  }

  onMounted(async () => {
    if (authService?.initialize) {
      try {
        await authService.initialize()
        await syncCurrentUser()
      } catch (error) {
        authStore.setError(error)
        toast.error('Unable to initialize authentication.', {
          description: error?.message || 'Please refresh and try again.',
        })
      }
    }
  })

  return {
    user,
    isAuthenticated,
    loading,
    actionLoading,
    userRoles,
    userPermissions,
    isAdmin,
    isPrivileged,
    login,
    register,
    loginWithProvider,
    registerWithProvider,
    logout,
    sendPasswordReset,
    resetPassword,
    updateUserProfile,
    changeUserPassword,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    redirectTarget: computed(() => route.query.redirect || '/'),
  }
}

export function useAuthGuard() {
  const { isAuthenticated, loading, hasAnyRole, hasAllPermissions } = useAuth()
  const router = useRouter()
  const route = useRoute()

  function requireAuth(redirectPath = '/auth') {
    if (!loading.value && !isAuthenticated.value) {
      router.push({ path: redirectPath, query: { redirect: route.fullPath } })
      return false
    }
    return true
  }

  function requireGuest(redirectPath = '/') {
    if (!loading.value && isAuthenticated.value) {
      router.push(redirectPath)
      return false
    }
    return true
  }

  function requireRole(roles, redirectPath = '/') {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    if (!loading.value && (!isAuthenticated.value || !hasAnyRole(roleArray))) {
      router.push(isAuthenticated.value ? redirectPath : { path: '/auth', query: { redirect: route.fullPath } })
      return false
    }
    return true
  }

  function requirePermission(permissions, redirectPath = '/') {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    if (!loading.value && (!isAuthenticated.value || !hasAllPermissions(permissionArray))) {
      router.push(isAuthenticated.value ? redirectPath : { path: '/auth', query: { redirect: route.fullPath } })
      return false
    }
    return true
  }

  return { requireAuth, requireGuest, requireRole, requirePermission }
}

export default { useAuth, useAuthGuard }
