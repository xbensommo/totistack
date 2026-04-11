/**
 * @file bootSequence.js
 * @description Executes the application boot sequence with lifecycle hooks.
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Boot sequence configuration.
 * @typedef {Object} BootContext
 * @property {Array} apps - Loaded app modules
 * @property {Array} features - Loaded feature modules
 * @property {Object} [config] - Boot configuration
 */

/**
 * Execute the application boot sequence.
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<void>}
 */
export async function bootSequence(app, context) {
  try {
    // Pre-boot hooks
    await executeHooks('beforeBoot', app, context);
    
    // Initialize environment
    await initializeEnvironment(app, context);
    
    // Load configuration
    await loadConfiguration(app, context);
    
    // Setup global guards
    await setupGuards(app, context);
    
    // Initialize services
    await initializeServices(app, context);
    
    // Post-boot hooks
    await executeHooks('afterBoot', app, context);
    
    // Mark app as ready
    app.config.globalProperties.$isReady = true;
    
    // Dispatch ready event
    const event = new CustomEvent('totistack:ready', { detail: context });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Boot sequence failed:', error);
    throw new Error(`Boot sequence failed: ${error.message}`);
  }
}

/**
 * Execute lifecycle hooks from modules.
 * @param {string} hookName - Name of the hook to execute
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<void>}
 */
async function executeHooks(hookName, app, context) {
  const allModules = [...context.apps, ...context.features];
  
  for (const module of allModules) {
    if (module.hooks && typeof module.hooks[hookName] === 'function') {
      try {
        await module.hooks[hookName](app, context);
      } catch (error) {
        console.error(`Error in ${hookName} hook for module ${module.id}:`, error);
      }
    }
  }
}

/**
 * Initialize environment variables and settings.
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<void>}
 */
async function initializeEnvironment(app, context) {
  // Set environment mode
  const isDev = import.meta.env.DEV;
  app.config.globalProperties.$isDev = isDev;
  app.config.globalProperties.$isProd = import.meta.env.PROD;
  
  // Set app version if available
  if (import.meta.env.VITE_APP_VERSION) {
    app.config.globalProperties.$version = import.meta.env.VITE_APP_VERSION;
  }
}

/**
 * Load application configuration.
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<void>}
 */
async function loadConfiguration(app, context) {
  try {
    // Load project config
    const projectConfig = await import('../../config/project.config.js')
      .then(m => m.default || m)
      .catch(() => ({}));
    app.config.globalProperties.$config = projectConfig;
    
    // Load branding config
    const brandingConfig = await import('../../config/branding.config.js')
      .then(m => m.default || m)
      .catch(() => ({}));
    app.config.globalProperties.$branding = brandingConfig;
    
    // Apply branding to document
    if (brandingConfig.colors) {
      applyBrandingColors(brandingConfig.colors);
    }
  } catch (error) {
    console.warn('Failed to load configuration:', error);
  }
}

/**
 * Setup global route guards and permissions.
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<void>}
 */
async function setupGuards(app, context) {
  const router = app.config.globalProperties.$router;
  if (!router) return;
  
  // Global auth guard
  router.beforeEach(async (to, from, next) => {
    // Check if route requires auth
    if (to.meta.requiresAuth) {
      const auth = app.config.globalProperties.$auth;
      if (!auth || !auth.currentUser) {
        next({ name: 'login', query: { redirect: to.fullPath } });
        return;
      }
    }
    
    // Check RBAC permissions
    if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
      const hasPermission = await checkPermissions(to.meta.permissions, app, context);
      if (!hasPermission) {
        next({ name: 'unauthorized' });
        return;
      }
    }
    
    next();
  });
}

/**
 * Initialize core services.
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<void>}
 */
async function initializeServices(app, context) {
  // Initialize notification service
  if (typeof window !== 'undefined') {
    // Setup error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // Could dispatch to error tracking service
    });
  }
}

/**
 * Apply branding colors to CSS variables.
 * @param {Object} colors - Color configuration
 */
function applyBrandingColors(colors) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--color-${key}`, value);
  }
}

/**
 * Check if user has required permissions.
 * @param {Array} requiredPermissions - Required permissions
 * @param {Object} app - Vue app instance
 * @param {BootContext} context - Boot context
 * @returns {Promise<boolean>}
 */
async function checkPermissions(requiredPermissions, app, context) {
  // Get user from auth store
  const authStore = app.config.globalProperties.$authStore;
  if (!authStore || !authStore.user) return false;
  
  const userPermissions = authStore.user.permissions || [];
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}