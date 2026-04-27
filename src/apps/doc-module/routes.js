/** @file src/apps/documents/routes.js */

/**
 * Create route contributions for the Totistack documents app.
 *
 * @param {{ routeBase?: string }} [context={}]
 * @returns {import('vue-router').RouteRecordRaw[]}
 */
export function createDocumentsRoutes(context = {}) {
  const routeBase = context.routeBase || '/documents';

  return [
    {
      path: routeBase,
      name: 'DocumentsStudio',
      component: () => import('./views/DocumentsStudioPage.vue'),
      meta: {
        title: 'Documents Studio',
        description: 'Create branded quotes, invoices, agreements, and PDF exports.',
        requiresAuth: true,
        layout: 'app',
        appId: 'documents',
        navLabel: 'Documents',
        icon: 'fa-regular fa-file-lines',
        order: 70,
        permission: 'documents.view',
      },
    },
  ];
}

export const documentsRoutes = createDocumentsRoutes();

export default documentsRoutes;
