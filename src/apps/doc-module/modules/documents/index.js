import './styles/studio.css';

export { default as BusinessDocumentsStudio } from './BusinessDocumentsStudio.vue';
export {
  createDocumentRegistry,
  defaultDocumentRegistry,
  defineDocumentDefinition,
  getDocumentDefinition,
  listBuiltInDocumentDefinitions,
  listDocumentDefinitions,
} from './registry/documentRegistry.js';
export { useDocumentStudio } from './composables/useDocumentStudio.js';
export { createBaseDocument } from './core/createBaseDocument.js';
export { normalizeDocument } from './core/normalizeDocument.js';
export { buildRenderSections, SectionFactories } from './core/buildRenderSections.js';
export { buildPagePlan } from './core/buildPagePlan.js';
export { buildDocumentNumber, resolveDocumentPrefix } from './domain/buildDocumentNumber.js';
export { computeDocumentTotals } from './domain/computeDocumentTotals.js';
export { normalizeDocumentPayload } from './domain/normalizeDocumentPayload.js';
export { createDocumentsService } from './services/createDocumentsService.js';
export { createBusinessDocumentPdfBytes, createBusinessDocumentPdfUrl } from './export/createPdfFile.js';
