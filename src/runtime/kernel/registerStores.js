/**
 * @file registerStores.js
 * @description Runtime store registration for generated projects
 * @date 2026-03-22
 * @author Totistack Team
 */

export async function registerStores(pinia, modules) {
  const stores = {};
  
  for (const module of modules) {
    if (module.store) {
      stores[module.id] = module.store(pinia);
    }
  }
  
  return stores;
}