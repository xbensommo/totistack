/**
 * @file src/modules/documents/services/createDocumentsStore.js
 * @description Direct root-store bindings for the document module.
 */

function resolveCollectionActions(store, explicitActions, collectionName) {
  const actionKey = `${collectionName}Actions`
  const actions = explicitActions?.[collectionName] || explicitActions?.[actionKey] || store?.[actionKey] || null

  if (!actions) {
    throw new Error(`[documents] Missing root-store shard actions: store.${actionKey}`)
  }

  return actions
}

export function createDocumentsStore(options = {}) {
  const store = options.store || null
  const explicitActions = options.actions || {}

  return {
    provider: store?.shardProvider || null,
    documents: resolveCollectionActions(store, explicitActions, 'documents'),
    auditLogs: resolveCollectionActions(store, explicitActions, 'document_audit_logs'),
    templates: resolveCollectionActions(store, explicitActions, 'document_templates'),
    sequences: resolveCollectionActions(store, explicitActions, 'document_sequences'),
  }
}
