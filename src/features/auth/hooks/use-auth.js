import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-sonner';
import { useAuthStore } from '../stores/auth-store';

/**
 * Auth composable
 * @returns {Object} Auth methods and state
 */
export function useAuth() {
  const authService = inject('authService');
  const authStore = useAuthStore();
  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  
  // Local loading state for actions
  const actionLoading = ref(false);
  
  // Computed properties from store
  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const loading = computed(() => authStore.loading);
  const userRoles = computed(() => authStore.userRoles);
  const isAdmin = computed(() => authStore.isAdmin);
  
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember me flag
   */
  const login = async (email, password, rememberMe = false) => {
    actionLoading.value = true;
    try {
      await authService.signInWithEmail(email, password);
      
      // Set persistence if needed
      if (!rememberMe) {
        // Set session persistence
        // This would be implemented based on Firebase auth persistence
      }
      
      // Load user data after successful login
      const firebaseUser = authService.getCurrentUser();
      if (firebaseUser) {
        await authStore.loadUserData(firebaseUser.uid, authService);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   */
  const register = async (email, password, userData = {}) => {
    actionLoading.value = true;
    try {
      await authService.registerWithEmail(email, password, userData);
      // Note: User might need to verify email before logging in
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Login with OAuth provider
   * @param {string} provider - Provider name
   */
  const loginWithProvider = async (provider) => {
    actionLoading.value = true;
    try {
      await authService.signInWithProvider(provider);
      
      // Load user data after successful OAuth login
      const firebaseUser = authService.getCurrentUser();
      if (firebaseUser) {
        await authStore.loadUserData(firebaseUser.uid, authService);
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Register with OAuth provider
   * @param {string} provider - Provider name
   */
  const registerWithProvider = loginWithProvider; // Same implementation
  
  /**
   * Logout user
   */
  const logout = async () => {
    actionLoading.value = true;
    try {
      await authService.signOut();
      authStore.clearUser();
      router.push({ name: 'auth.login' });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Send password reset email
   * @param {string} email - User email
   */
  const sendPasswordReset = async (email) => {
    actionLoading.value = true;
    try {
      await authService.sendPasswordReset(email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   */
  const resetPassword = async (token, newPassword) => {
    actionLoading.value = true;
    try {
      await authService.confirmPasswordReset(token, newPassword);
      toast.success('Password reset successfully! You can now login.');
      router.push({ name: 'auth.login' });
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   */
  const updateUserProfile = async (profileData) => {
    actionLoading.value = true;
    try {
      await authService.updateUserProfile(profileData);
      
      // Update store with new data
      const firebaseUser = authService.getCurrentUser();
      if (firebaseUser) {
        await authStore.loadUserData(firebaseUser.uid, authService);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  const changeUserPassword = async (currentPassword, newPassword) => {
    actionLoading.value = true;
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Delete user account
   */
  const deleteUserAccount = async () => {
    actionLoading.value = true;
    try {
      await authService.deleteAccount();
      authStore.clearUser();
      toast.success('Account deleted successfully.');
      router.push('/');
    } catch (error) {
      console.error('Account deletion failed:', error);
      throw error;
    } finally {
      actionLoading.value = false;
    }
  };
  
  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has role
   */
  const hasRole = (role) => {
    return userRoles.value.includes(role);
  };
  
  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roles - Roles to check
   * @returns {boolean} Whether user has any role
   */
  const hasAnyRole = (roles) => {
    return roles.some(role => userRoles.value.includes(role));
  };
  
  /**
   * Check if user has all specified roles
   * @param {Array<string>} roles - Roles to check
   * @returns {boolean} Whether user has all roles
   */
  const hasAllRoles = (roles) => {
    return roles.every(role => userRoles.value.includes(role));
  };
  
  // Initialize auth listener on mount
  onMounted(() => {
    if (authService) {
      authStore.initAuthListener(authService);
    }
  });
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (authService && authService.cleanup) {
      authService.cleanup();
    }
  });
  
  return {
    // State
    user,
    isAuthenticated,
    loading,
    actionLoading,
    userRoles,
    isAdmin,
    
    // Methods
    login,
    register,
    loginWithProvider,
    registerWithProvider,
    logout,
    sendPasswordReset,
    resetPassword,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    
    // Role helpers
    hasRole,
    hasAnyRole,
    hasAllRoles
  };
}

/**
 * Auth guard composable
 * @returns {Object} Auth guard state
 */
export function useAuthGuard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const route = useRoute();
  
  /**
   * Require authentication for current route
   * @param {string} redirectPath - Path to redirect if not authenticated
   */
  const requireAuth = (redirectPath = '/login') => {
    if (!loading.value && !isAuthenticated.value) {
      router.push({
        path: redirectPath,
        query: { redirect: route.fullPath }
      });
      return false;
    }
    return true;
  };
  
  /**
   * Require guest (non-authenticated) for current route
   * @param {string} redirectPath - Path to redirect if authenticated
   */
  const requireGuest = (redirectPath = '/') => {
    if (!loading.value && isAuthenticated.value) {
      router.push(redirectPath);
      return false;
    }
    return true;
  };
  
  /**
   * Require specific role for current route
   * @param {string|Array<string>} roles - Required role(s)
   * @param {string} redirectPath - Path to redirect if not authorized
   */
  const requireRole = (roles, redirectPath = '/') => {
    const { hasAnyRole, isAuthenticated, loading } = useAuth();
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    if (!loading.value) {
      if (!isAuthenticated.value) {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        });
        return false;
      }
      
      if (!hasAnyRole(roleArray)) {
        router.push(redirectPath);
        return false;
      }
    }
    return true;
  };
  
  return {
    requireAuth,
    requireGuest,
    requireRole
  };
}

export default {
  useAuth,
  useAuthGuard
};