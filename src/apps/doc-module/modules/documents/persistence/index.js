/** @file src/modules/documents/persistence/index.js */
export { createDocumentsStore } from '../services/createDocumentsStore.js';
export {
  documentsCollection,
  documentTemplatesCollection,
  documentAuditLogsCollection,
  documentSequencesCollection,
} from '../contracts/collections.js';
