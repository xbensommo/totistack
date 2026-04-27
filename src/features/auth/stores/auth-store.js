import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Thin auth feature store for local UI state only.
 * The source of truth remains the root access/app store.
 */
export const useAuthStore = defineStore('authFeature', () => {
  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(user.value?.uid || user.value?.id))
  const currentUser = computed(() => user.value)
  const userRoles = computed(() => Array.isArray(user.value?.roles) ? user.value.roles : [])
  const isAdmin = computed(() => userRoles.value.includes('admin') || userRoles.value.includes('sysadmin'))

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

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    currentUser,
    userRoles,
    isAdmin,
    syncFromAccess,
    setLoading,
    setError,
    clearUser,
  }
})

export default useAuthStore
