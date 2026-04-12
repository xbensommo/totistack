/**
 * @file media/feature.manifest.js
 * @description Declarative manifest for the Totistack media feature.
 */
export default {
  id: 'media',
  type: 'feature',
  name: 'Media',
  version: '3.0.0',
  description: 'Media library, foldering, metadata management, and upload workflow shells.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: [],
  },
  collections: ['mediaFiles', 'mediaFolders'],
  services: ['mediaService'],
  routes: ['./routes.js'],
}
