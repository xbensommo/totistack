/**
 * @file registerRoutes.js
 * @description Registers routes with Vue Router
 * @date 2026-03-22
 * @author Totistack Team
 */

import { logger } from '../utils/logger.js';

/**
 * Register routes from modules with the router
 * @param {object} router - Vue Router instance
 * @param {Array} modules - Modules with routes
 * @returns {Promise<void>}
 */
export async function registerRoutes(router, modules = []) {
  try {
    let routeCount = 0;
    
    for (const module of modules) {
      if (module.routes && Array.isArray(module.routes)) {
        for (const route of module.routes) {
          router.addRoute(route);
          routeCount++;
          logger.debug(`Added route: ${route.path} from ${module.id}`);
        }
      }
      
      // Handle nested routes
      if (module.routesConfig && typeof module.routesConfig === 'object') {
        for (const [parentPath, childRoutes] of Object.entries(module.routesConfig)) {
          for (const route of childRoutes) {
            router.addRoute(parentPath, route);
            routeCount++;
            logger.debug(`Added nested route: ${parentPath}${route.path} from ${module.id}`);
          }
        }
      }
    }
    
    logger.info(`Registered ${routeCount} routes`);
  } catch (error) {
    logger.error('Failed to register routes:', error);
    throw error;
  }
}

/**
 * Add a single route
 * @param {object} router - Vue Router instance
 * @param {object} route - Route definition
 * @param {string} parentPath - Optional parent path
 */
export function addRoute(router, route, parentPath = null) {
  if (parentPath) {
    router.addRoute(parentPath, route);
  } else {
    router.addRoute(route);
  }
  logger.debug(`Added route: ${route.path}`);
}