/**
 * @file media/routes.js
 * @description Route records contributed by the media feature.
 */
export default [
  {
    path: '/admin/media',
    name: 'MediaLibrary',
    component: () => import('./pages/MediaLibraryPage.vue'),
    meta: { requiresAuth: true, feature: 'media', permissions: ['media.view'], title: 'Media Library' },
  },
  {
    path: '/admin/media/upload',
    name: 'MediaUpload',
    component: () => import('./pages/MediaUploadPage.vue'),
    meta: { requiresAuth: true, feature: 'media', permissions: ['media.manage'], title: 'Upload Media' },
  },
]
