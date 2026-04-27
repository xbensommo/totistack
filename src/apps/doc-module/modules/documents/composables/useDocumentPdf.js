/** @file src/modules/documents/composables/useDocumentPdf.js */
import { ref } from 'vue';
export function useDocumentPdf(documentsService) {
  const loading = ref(false);
  const error = ref(null);
  async function generatePdf(input) {
    loading.value = true; error.value = null;
    try { return await documentsService.generatePdf(input); }
    catch (err) { error.value = err; throw err; }
    finally { loading.value = false; }
  }
  return { loading, error, generatePdf };
}
