function createHtmlSection(kind, title, html, options = {}) {
  return {
    kind,
    title,
    html: String(html || ''),
    keepWithNext: Boolean(options.keepWithNext),
  };
}

function createListSection(kind, title, items) {
  return {
    kind,
    title,
    items: Array.isArray(items) ? items : [],
  };
}

function createTableSection(items) {
  return {
    kind: 'table',
    title: 'Line Items',
    columns: [
      { key: 'description', label: 'Description', width: '52%' },
      { key: 'quantity', label: 'Qty', width: '12%', align: 'right' },
      { key: 'unitPrice', label: 'Rate', width: '18%', align: 'right' },
      { key: 'total', label: 'Amount', width: '18%', align: 'right' },
    ],
    items,
  };
}

function createTotalsSection(finance) {
  return {
    kind: 'totals',
    title: 'Totals',
    finance,
  };
}

function createSignaturesSection(signatures) {
  return {
    kind: 'signatures',
    title: 'Signatures',
    signatures,
  };
}

function createPartiesSection(parties) {
  return {
    kind: 'parties',
    title: 'Parties',
    parties,
  };
}

function createMetaSection(meta) {
  return {
    kind: 'meta',
    title: 'Document Information',
    meta,
  };
}

export function buildRenderSections(document, definition) {
  const sections = [
    createMetaSection(document.meta),
    createPartiesSection(document.parties),
  ];

  const builtSections = definition.buildSections(document) || [];
  sections.push(...builtSections);

  if (document.workflow?.requiresClientSignature || document.signatures?.issuer?.name || document.signatures?.client?.name) {
    sections.push(createSignaturesSection(document.signatures));
  }

  return sections;
}

export const SectionFactories = {
  createHtmlSection,
  createListSection,
  createTableSection,
  createTotalsSection,
};
