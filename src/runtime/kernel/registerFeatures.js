/**
 * @file registerFeatures.js
 * @description Dynamically loads and registers feature modules.
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Load all installed feature modules.
 * @returns {Promise<Array>} Array of loaded feature modules
 */
export async function loadFeatures() {
  try {
    const modules = import.meta.glob('../../features/*/index.js', { eager: false });
    const loadedFeatures = [];
    
    for (const [path, importFn] of Object.entries(modules)) {
      try {
        const module = await importFn();
        const featureConfig = module.default || module;
        
        if (!featureConfig.id) {
          console.warn(`Feature ${path} missing required 'id' property`);
          continue;
        }
        
        loadedFeatures.push({
          ...featureConfig,
          _path: path,
        });
      } catch (error) {
        console.error(`Failed to load feature ${path}:`, error);
      }
    }
    
    return loadedFeatures;
  } catch (error) {
    console.error('Failed to load features:', error);
    return [];
  }
}

/**
 * Load a single feature module by ID.
 * @param {string} featureId - The feature identifier
 * @returns {Promise<Object|null>} The loaded feature module or null if not found
 */
export async function loadFeatureById(featureId) {
  try {
    const module = await import(`../../features/${featureId}/index.js`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load feature ${featureId}:`, error);
    return null;
  }
}