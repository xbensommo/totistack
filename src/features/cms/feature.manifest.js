/**
 * CMS Feature Manifest
 * @module features/cms
 * @description Content Management System with page builder, content types, and SEO management
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  id: 'cms',
  name: 'Content Management System',
  version: '2.0.0',
  description: 'Complete CMS with page builder, content types, media management, and SEO',
  
  dependencies: {
    features: ['auth', 'rbac', 'media'],
    apps: []
  },
  
  configSchema: {
    type: 'object',
    properties: {
      enableVersioning: { type: 'boolean', default: true },
      enablePreview: { type: 'boolean', default: true },
      maxVersions: { type: 'number', default: 10 },
      defaultLocale: { type: 'string', default: 'en' },
      supportedLocales: { type: 'array', default: ['en'] }
    }
  },
  
  collections: [
    'contentTypes',
    'contentEntries',
    'contentVersions',
    'pages',
    'pageBlocks',
    'menus',
    'seoMetadata',
    'redirects'
  ],
  
  services: ['cmsService', 'pageBuilderService', 'seoService', 'contentTypeService'],
  
  stores: ['cms'],
  
  components: ['PageBuilder', 'ContentEditor', 'MediaPicker', 'SeoPanel'],
  
  hooks: ['onContentPublish', 'onPageCreate', 'onSeoUpdate']
};