/**
 * @file router.mutator.js
 * @description Mutator for router/index.js to add routes from modules
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Update router configuration with new routes
 * @param {string} projectRoot - Project root
 * @param {Array} routes - Routes to add
 * @param {Array} imports - Import statements to add
 * @returns {Promise<void>}
 */
export async function mutateRouter(projectRoot, routes, imports = []) {
  const routerPath = path.join(projectRoot, 'src', 'app', 'router/routes', 'index.js');
  
  if (!await fs.pathExists(routerPath)) {
    throw new InstallError('router/index.js not found');
  }

  try {
    let content = await fs.readFile(routerPath, 'utf8');
    
    // Add imports at the top
    for (const imp of imports) {
      if (!content.includes(imp)) {
        content = imp + '\n' + content;
      }
    }
    
    // Find routes array and inject new routes
    const routesRegex = /const routes = \[([\s\S]*?)\];/;
    const match = content.match(routesRegex);
    
    if (match) {
      const existingRoutes = match[1];
      const newRoutesCode = generateRoutesCode(routes);
      const updatedRoutes = existingRoutes + (existingRoutes.trim() ? ',\n' : '') + newRoutesCode;
      content = content.replace(routesRegex, `const routes = [${updatedRoutes}];`);
    }
    
    await fs.writeFile(routerPath, content);
    logger.info(`Updated router with ${routes.length} new routes`);
  } catch (err) {
    throw new InstallError(`Failed to update router: ${err.message}`, { cause: err });
  }
}

/**
 * Generate route code as string
 * @param {Array} routes - Route definitions
 * @returns {string}
 */
function generateRoutesCode(routes) {
  return routes.map(route => {
    const routeObj = {
      path: route.path,
      name: route.name,
      component: route.component,
      meta: route.meta || {}
    };
    return JSON.stringify(routeObj, null, 2);
  }).join(',\n');
}