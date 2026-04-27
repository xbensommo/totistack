/** @file src/apps/doc-module/modules/documents/pdf/renderers/ContractContentRenderer.js */

export function estimateContractIntroHeight(ctx = {}) {
  const summary = String(ctx?.document?.content?.summaryHtml || '')
  const base = 120
  return base + Math.min(summary.length * 0.12, 120)
}

export function estimateContractSignatureHeight(ctx = {}) {
  const signatories = Array.isArray(ctx?.document?.parties?.signatories)
    ? ctx.document.parties.signatories.length
    : 2
  return 110 + (Math.max(signatories, 1) * 36)
}
