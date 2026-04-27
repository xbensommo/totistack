/** @file src/modules/documents/composables/useTemplateEditor.js */
import { ref } from 'vue';
import { DEFAULT_TEMPLATE } from '../contracts/template.contract.js';
export function useTemplateEditor(initial = {}) {
  const template = ref({ ...structuredClone(DEFAULT_TEMPLATE), ...structuredClone(initial) });
  function setBrandingColor(key, value) { template.value.branding[key] = value; }
  function toggleHeader(value) { template.value.header.enabled = Boolean(value); }
  function toggleFooter(value) { template.value.footer.enabled = Boolean(value); }
  return { template, setBrandingColor, toggleHeader, toggleFooter };
}
