/**
 * @file registerRoutes.js
 * @description Runtime route registration for generated projects
 * @date 2026-03-22
 * @author Totistack Team
 */

export async function registerRoutes(router, modules) {
  for (const module of modules) {
    if (module.routes) {
      module.routes.forEach(route => router.addRoute(route));
    }
  }
}