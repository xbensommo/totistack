import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  hasAllAuthPermissions,
  hasAnyAuthPermission,
  hasAuthPermission,
  normalizeRoleKeys,
  resolveEffectivePermissions,
} from '../permissions.js'

/**
 * Thin auth feature store for local UI state only.
 * The root access store remains the source of truth.
 */
export const useAuthStore = defineStore('authFeature', () => {
  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(user.value?.uid || user.value?.id))
  const currentUser = computed(() => user.value)
  const userRoles = computed(() => normalizeRoleKeys(user.value?.roles || [user.value?.role]))
  const userPermissions = computed(() => resolveEffectivePermissions(user.value || {}))
  const isAdmin = computed(() => userRoles.value.includes('admin') || userRoles.value.includes('sysadmin'))
  const isPrivileged = computed(() => userRoles.value.some((role) => ['admin', 'security-admin', 'sysadmin'].includes(role)))

  function syncFromAccess(access = null) {
    user.value = access ? { ...access } : null
    initialized.value = true
  }

  function setLoading(value) {
    loading.value = Boolean(value)
  }

  function setError(nextError = null) {
    error.value = nextError
  }

  function clearUser() {
    user.value = null
  }

  function hasPermission(permission) {
    return hasAuthPermission(user.value, permission)
  }

  function hasAnyPermission(permissions = []) {
    return hasAnyAuthPermission(user.value, permissions)
  }

  function hasAllPermissions(permissions = []) {
    return hasAllAuthPermissions(user.value, permissions)
  }

  function hasRole(role) {
    return userRoles.value.includes(role)
  }

  function hasAnyRole(roles = []) {
    return normalizeRoleKeys(roles).some((role) => userRoles.value.includes(role))
  }

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    currentUser,
    userRoles,
    userPermissions,
    isAdmin,
    isPrivileged,
    syncFromAccess,
    setLoading,
    setError,
    clearUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }
})

export default useAuthStore
