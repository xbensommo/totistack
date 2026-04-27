/** @file src/modules/documents/services/createTemplateService.js */
import { DEFAULT_TEMPLATE } from '../contracts/template.contract.js';
export function createTemplateService({ stores }) {
  return {
    async createTemplate(template = {}) { return stores.templates.add({ ...DEFAULT_TEMPLATE, ...template }); },
    async updateTemplate(id, patch, shardSource) { return stores.templates.update(id, patch, shardSource); },
    async getDefaultTemplate() { return structuredClone(DEFAULT_TEMPLATE); },
  };
}
