/** @file src/modules/documents/registry/documentRegistry.js */
import { contractDefinition } from '../definitions/contract.definition.js';
import { invoiceDefinition } from '../definitions/invoice.definition.js';
import { scopeOfWorkDefinition } from '../definitions/scope-of-work.definition.js';
import { changeRequestDefinition } from '../definitions/change-request.definition.js';
import { hostingAgreementDefinition } from '../definitions/hosting-agreement.definition.js';
import { softwareDevelopmentContractDefinition } from '../definitions/software-development-contract.definition.js';

const builtInDefinitions = [
  contractDefinition,
  invoiceDefinition,
  scopeOfWorkDefinition,
  changeRequestDefinition,
  hostingAgreementDefinition,
  softwareDevelopmentContractDefinition,
];

export function defineDocumentDefinition(definition = {}) {
  const id = String(definition.id || '').trim();
  const label = String(definition.label || definition.name || id).trim();

  if (!id) {
    throw new Error('Document definition requires a non-empty id.');
  }

  if (typeof definition.createDefaultDocument !== 'function') {
    throw new Error(`Document definition "${id}" must provide createDefaultDocument().`);
  }

  if (typeof definition.validate !== 'function') {
    throw new Error(`Document definition "${id}" must provide validate(document).`);
  }

  if (typeof definition.buildSections !== 'function') {
    throw new Error(`Document definition "${id}" must provide buildSections(document).`);
  }

  return {
    priority: 100,
    category: 'Custom',
    statuses: ['draft'],
    numberingPrefix: '',
    ...definition,
    id,
    label,
  };
}

export function createDocumentRegistry(definitions = []) {
  const normalizedDefinitions = [...builtInDefinitions, ...(Array.isArray(definitions) ? definitions : [])]
    .map((definition) => defineDocumentDefinition(definition));

  const definitionMap = new Map();
  for (const definition of normalizedDefinitions) {
    definitionMap.set(definition.id, definition);
  }

  const orderedDefinitions = Array.from(definitionMap.values()).sort((left, right) => {
    const leftPriority = Number(left.priority || 0);
    const rightPriority = Number(right.priority || 0);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return String(left.label || left.id).localeCompare(String(right.label || right.id));
  });

  return {
    definitions: orderedDefinitions,
    list() {
      return orderedDefinitions.slice();
    },
    get(type, fallbackType) {
      return definitionMap.get(type) || definitionMap.get(fallbackType) || orderedDefinitions[0] || null;
    },
    has(type) {
      return definitionMap.has(type);
    },
  };
}

export const defaultDocumentRegistry = createDocumentRegistry();

export function listBuiltInDocumentDefinitions() {
  return builtInDefinitions.map((definition) => defineDocumentDefinition(definition));
}

export function listDocumentDefinitions(options = {}) {
  const registry = options.registry || createDocumentRegistry(options.definitions || []);
  return registry.list();
}

export function getDocumentDefinition(type, options = {}) {
  const registry = options.registry || createDocumentRegistry(options.definitions || []);
  return registry.get(type, options.fallbackType);
}
