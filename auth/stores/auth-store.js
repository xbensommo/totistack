import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Auth Store
 * @description Manages authentication state using Pinia
 */
export const useAuthStore = defineStore('authStore', () => {
  // State
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const currentUser = computed(() => user.value);
  const userRoles = computed(() => user.value?.roles || []);
  const isAdmin = computed(() => userRoles.value.includes('admin'));
  
  // Actions
  /**
   * Initialize auth state listener
   * @param {AuthService} authService - Auth service instance
   */
  const initAuthListener = (authService) => {
    loading.value = true;
    
    authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Load user data from Firestore
        loadUserData(firebaseUser.uid, authService);
      } else {
        user.value = null;
        loading.value = false;
      }
    });
  };
  
  /**
   * Load user data from Firestore
   * @param {string} uid - User ID
   * @param {AuthService} authService - Auth service instance
   */
  const loadUserData = async (uid, authService) => {
    try {
      const userDoc = await authService.getUserDoc(uid);
      user.value = {
        uid,
        ...userDoc.data(),
        ...authService.getCurrentUser()
      };
    } catch (err) {
      console.error('Failed to load user data:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Set user data
   * @param {Object} userData - User data
   */
  const setUser = (userData) => {
    user.value = userData;
  };
  
  /**
   * Clear user data
   */
  const clearUser = () => {
    user.value = null;
  };
  
  /**
   * Set loading state
   * @param {boolean} state - Loading state
   */
  const setLoading = (state) => {
    loading.value = state;
  };
  
  /**
   * Set error
   * @param {string} errorMessage - Error message
   */
  const setError = (errorMessage) => {
    error.value = errorMessage;
  };
  
  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null;
  };
  
  return {
    // State
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    currentUser,
    userRoles,
    isAdmin,
    
    // Actions
    initAuthListener,
    loadUserData,
    setUser,
    clearUser,
    setLoading,
    setError,
    clearError
  };
});

export default useAuthStore;