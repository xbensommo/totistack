export function createDefaultManifest(overrides = {}) {
  return {
    name: '',
    framework: 'vue',
    stack: 'vue-firebase',
    preset: null,
    features: [],
    featureConfig: {},
    options: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}