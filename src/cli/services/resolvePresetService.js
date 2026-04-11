/**
 * Resolves a preset into a list of apps and features.
 * In the real implementation, this would load preset definitions from src/presets/.
 * @param {string} presetId - ID of the preset (e.g., 'business-core')
 * @returns {Promise<{apps: string[], features: string[]}>}
 */

export async function resolvePresetService(presetId) {
  if (presetId === 'custom') {
    return { apps: [], features: [] };
  }

  const presets = {
    'business-core': { apps: ['crm', 'forms', 'dashboard'], features: ['auth', 'rbac', 'analytics'] },
    'service-business': { apps: ['booking-platform', 'messaging', 'payments'], features: ['auth', 'notifications'] },
    'commerce': { apps: ['catalog', 'payments', 'cms'], features: ['auth', 'search', 'analytics'] },
    'internal-ops': { apps: ['crm', 'cms', 'workflows'], features: ['auth', 'rbac', 'audit-logs'] },
    'crm-suite': { apps: ['crm', 'messaging', 'dashboard'], features: ['auth', 'rbac', 'analytics', 'workflows'] },
  };

  const preset = presets[presetId] || { apps: [], features: [] };
  return preset;
}

/*export async function resolvePresetService(presetId) {
  // Placeholder: return empty for 'custom', else some default sets
  if (presetId === 'custom') {
    return { apps: [], features: [] };
  }

  // Simulate preset data (in real code, load from presets registry)
  const presets = {
    'business-core': { apps: ['crm', 'forms', 'dashboard'], features: ['auth', 'rbac', 'analytics'] },
    'service-business': { apps: ['booking-platform', 'messaging', 'payments'], features: ['auth', 'notifications'] },
    'commerce': { apps: ['catalog', 'payments', 'cms'], features: ['auth', 'search', 'analytics'] },
    'internal-ops': { apps: ['crm', 'cms', 'workflows'], features: ['auth', 'rbac', 'audit-logs'] },
    'crm-suite': { apps: ['crm', 'messaging', 'dashboard'], features: ['auth', 'rbac', 'analytics', 'workflows'] },
  };

  const preset = presets[presetId] || { apps: [], features: [] };
  return preset;
}*/