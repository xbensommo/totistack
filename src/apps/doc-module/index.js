/** @file src/apps/documents/index.js */
export * from './modules/documents/index.js';
export {  documentsRoutes as routes } from './routes.js';
export { DOCUMENTS_APP_ID, documentsAppManifest as manifest } from './app.manifest.js';

export { default as document_sequences } from './definitions/document_sequences.definitions.js';
export { default as document_audit_logs } from './definitions/document_audit_logs.definitions.js';
export { default as document_templatesDoc } from './definitions/document_templates.definitions.js';
export { default as documentsDoc } from './definitions/documents.definitions.js';

export { default as DocumentsStudioPage } from './views/DocumentsStudioPage.vue';
export { default as routes } from './routes.js';
export { default as documentsAppManifestDefault } from './app.manifest.js';
