/** @file src/modules/documents/composables/useDocumentEditor.js */
import { computed, ref } from 'vue';
import { normalizeDocumentPayload } from '../domain/normalizeDocumentPayload.js';
export function useDocumentEditor(initial = {}) {
  const draft = ref(normalizeDocumentPayload(initial));
  const lineItemCount = computed(() => draft.value.lineItems.length);
  function addLineItem() { draft.value.lineItems.push({ description: '', qty: 1, unitPrice: 0, total: 0 }); }
  function removeLineItem(index) { draft.value.lineItems.splice(index, 1); }
  function setStatus(status) { draft.value.status = status; }
  return { draft, lineItemCount, addLineItem, removeLineItem, setStatus };
}
