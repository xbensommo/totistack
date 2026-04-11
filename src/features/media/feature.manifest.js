/**
 * Media Feature Manifest
 * @module features/media
 * @description Media management feature providing file upload, storage, image optimization,
 *              and asset management for Totistack v2.
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'media',
  name: 'Media Management',
  version: '2.0.0',
  description: 'File upload, storage, image optimization, and digital asset management',
  
  // Dependencies
  dependencies: {
    features: ['auth'],
    apps: []
  },
  
  // Configuration schema
  configSchema: {
    type: 'object',
    properties: {
      maxFileSize: {
        type: 'number',
        description: 'Maximum file size in bytes',
        default: 10485760 // 10MB
      },
      allowedMimeTypes: {
        type: 'array',
        items: { type: 'string' },
        default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      },
      imageOptimization: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          maxWidth: { type: 'number', default: 1920 },
          maxHeight: { type: 'number', default: 1080 },
          quality: { type: 'number', default: 80 }
        }
      },
      storageBucket: {
        type: 'string',
        description: 'Firebase Storage bucket',
        default: ''
      },
      enableCdn: {
        type: 'boolean',
        default: true
      }
    }
  },
  
  // Collections provided
  collections: ['media', 'mediaFolders'],
  
  // Services provided
  services: ['mediaService', 'uploadService', 'imageService'],
  
  // Store modules
  stores: ['media'],
  
  // Components provided
  components: ['MediaUploader', 'MediaGallery', 'MediaPicker', 'ImageCropper'],
  
  // Hooks
  hooks: ['onMediaUpload', 'onMediaDelete', 'onMediaProcess']
};
