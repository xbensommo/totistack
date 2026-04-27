/** @file src/apps/documents/app.manifest.js */
import documentsRoutes from './routes.js';

export const DOCUMENTS_APP_ID = 'documents';

/**
 * Totistack app contribution for the business documents studio.
 */
export const documentsAppManifest = {
  id: DOCUMENTS_APP_ID,
  kind: 'app',
  version: '2.0.0',
  name: 'Documents',
  description: 'Business documents studio with template definitions, live preview, workflow status, signatures, and PDF export.',
  category: 'operations',
  icon: 'fa-regular fa-file-lines',
  order: 70,
  routeBase: '/documents',
  entry: {
    routeName: 'DocumentsStudio',
    view: 'DocumentsStudioPage',
  },
  navigation: [
    {
      label: 'Documents',
      to: '/documents',
      icon: 'fa-regular fa-file-lines',
      order: 70,
      permission: 'documents.view',
      roles: ['admin', 'manager', 'sales'],
    },
  ],
  permissions: [
    'documents.view',
    'documents.manage',
    'documents.export',
  ],
  routes: documentsRoutes,
  collections: [
    'document_sequences', 'document_audit_logs', 'document_templates', 'documents'
  ],
  capabilities: {
    templates: true,
    workflow: true,
    livePreview: true,
    pdfExport: true,
    signatures: true,
  },
  dependencies: {
    features: ['auth', 'rbac'],
  },
};

export default documentsAppManifest;
