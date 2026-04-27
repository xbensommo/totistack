/** @file src/modules/documents/composables/useDocumentStudio.js */
import { computed, reactive, ref, watch } from 'vue';
import { deepClone } from '../utils/deepClone.js';
import { createDocumentRegistry } from '../registry/documentRegistry.js';
import { normalizeDocument } from '../core/normalizeDocument.js';
import { buildRenderSections } from '../core/buildRenderSections.js';
import { buildPagePlan } from '../core/buildPagePlan.js';

export function useDocumentStudio(initialType = 'contract', options = {}) {
  const registry = options.registry || createDocumentRegistry(options.definitions || []);
  const documentDefinitions = registry.list();
  const startingDefinition = registry.get(initialType) || documentDefinitions[0] || null;
  const selectedType = ref(startingDefinition?.id || initialType);
  const definition = ref(startingDefinition);
  const documentDraft = reactive(deepClone(startingDefinition?.createDefaultDocument?.() || {}));
  const validationErrors = ref([]);

  function replaceDraft(nextDocument) {
    Object.keys(documentDraft).forEach((key) => delete documentDraft[key]);
    Object.assign(documentDraft, deepClone(nextDocument));
  }

  watch(selectedType, (nextType) => {
    definition.value = registry.get(nextType, initialType);

    if (!definition.value) {
      replaceDraft({});
      validationErrors.value = ['No document definition is available.'];
      return;
    }

    replaceDraft(definition.value.createDefaultDocument());
    validationErrors.value = [];
  });

  const normalizedDocument = computed(() => normalizeDocument(documentDraft));
  const renderSections = computed(() => (
    definition.value
      ? buildRenderSections(normalizedDocument.value, definition.value)
      : []
  ));
  const pagePlan = computed(() => buildPagePlan(normalizedDocument.value, renderSections.value));

  function validate() {
    if (!definition.value) {
      validationErrors.value = ['No document definition is available.'];
      return validationErrors.value;
    }

    validationErrors.value = definition.value.validate(normalizedDocument.value);
    return validationErrors.value;
  }

  function addRichBlock() {
    if (!Array.isArray(documentDraft.content.richBlocks)) {
      documentDraft.content.richBlocks = [];
    }

    documentDraft.content.richBlocks.push({
      id: `block_${Date.now()}`,
      label: `Clause ${documentDraft.content.richBlocks.length + 1}`,
      html: '<p>New clause content.</p>',
    });
  }

  function removeRichBlock(index) {
    documentDraft.content.richBlocks.splice(index, 1);
  }

  function addListItem(key, label) {
    if (!Array.isArray(documentDraft.content[key])) {
      documentDraft.content[key] = [];
    }

    documentDraft.content[key].push({
      id: `${key}_${Date.now()}`,
      label,
      value: '',
    });
  }

  function removeListItem(key, index) {
    if (!Array.isArray(documentDraft.content[key])) return;
    documentDraft.content[key].splice(index, 1);
  }

  function addLineItem() {
    if (!Array.isArray(documentDraft.content.lineItems)) {
      documentDraft.content.lineItems = [];
    }

    documentDraft.content.lineItems.push({
      id: `line_${Date.now()}`,
      description: 'New line item',
      quantity: 1,
      unitPrice: 0,
    });
  }

  function removeLineItem(index) {
    if (!Array.isArray(documentDraft.content.lineItems)) return;
    documentDraft.content.lineItems.splice(index, 1);
  }

  function resetCurrentDocument() {
    if (!definition.value) return;
    replaceDraft(definition.value.createDefaultDocument());
    validationErrors.value = [];
  }

  return {
    documentDefinitions,
    selectedType,
    definition,
    documentDraft,
    normalizedDocument,
    renderSections,
    pagePlan,
    validationErrors,
    validate,
    addRichBlock,
    removeRichBlock,
    addListItem,
    removeListItem,
    addLineItem,
    removeLineItem,
    resetCurrentDocument,
  };
}
