/** @file src/modules/documents/pdf/layout/PdfPaginator.js */
import { createPageBox } from './pageBox.js';
import { measureText } from './measureText.js';

function wrapText(font, text, size, maxWidth) {
  const value = String(text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = value.split('\n');
  const lines = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measureText(font, candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) lines.push(current);

      if (measureText(font, word, size) <= maxWidth) {
        current = word;
        continue;
      }

      let fragment = '';
      for (const char of word) {
        const next = `${fragment}${char}`;
        if (measureText(font, next, size) <= maxWidth) {
          fragment = next;
        } else {
          if (fragment) lines.push(fragment);
          fragment = char;
        }
      }
      current = fragment;
    }

    if (current) lines.push(current);
  }

  return lines.length ? lines : [''];
}

export class PdfPaginator {
  paginate(ctx) {
    const template = ctx.template;
    const document = ctx.document;
    const pageBox = createPageBox({
      pageWidth: ctx.pageWidth,
      pageHeight: ctx.pageHeight,
      margins: ctx.margins,
      headerHeight: template.header?.enabled ? template.header.height : 0,
      footerHeight: template.footer?.enabled ? template.footer.height : 0,
    });

    const pages = [];
    const lineItems = document.lineItems || [];
    const terms = document.terms || [];
    const fonts = ctx.fonts;

    const metaHeight = this.#estimateMetaHeight(ctx);
    const partiesHeight = this.#estimatePartiesHeight(ctx);
    const tableHeaderHeight = template.table?.headerHeight || 24;
    const summaryHeight = this.#estimateTotalsHeight(ctx);
    const termsHeight = terms.length ? this.#estimateTermsHeight(ctx, terms) : 0;
    const signatureHeight = template.signatureBlock?.enabled ? this.#estimateSignatureHeight(ctx) : 0;
    const summaryReserve = summaryHeight + termsHeight + signatureHeight;

    const firstPageStatic = metaHeight + partiesHeight + tableHeaderHeight + 12;
    const continuationStatic = tableHeaderHeight + 6;

    let itemIndex = 0;
    let pageNumber = 0;

    if (!lineItems.length) {
      pages.push({
        pageBox,
        header: {},
        footer: {},
        sections: [
          { type: 'meta' },
          { type: 'parties' },
          { type: 'table', data: { items: [] } },
          { type: 'totals' },
          ...(terms.length ? [{ type: 'terms', data: { terms } }] : []),
          ...(template.signatureBlock?.enabled ? [{ type: 'signature' }] : []),
        ],
      });
      return pages;
    }

    while (itemIndex < lineItems.length) {
      const isFirstPage = pageNumber === 0;
      const baseStaticHeight = isFirstPage ? firstPageStatic : continuationStatic;
      const availableForRows = pageBox.height - baseStaticHeight;
      const currentItems = [];
      let usedHeight = 0;

      while (itemIndex < lineItems.length) {
        const item = lineItems[itemIndex];
        const rowHeight = this.#estimateRowHeight(ctx, item);
        const remainingItemsAfterThis = lineItems.length - itemIndex - 1;
        const reserve = remainingItemsAfterThis === 0 ? summaryReserve : 0;

        if (usedHeight + rowHeight + reserve <= availableForRows || currentItems.length === 0) {
          currentItems.push(item);
          usedHeight += rowHeight;
          itemIndex += 1;
          continue;
        }

        break;
      }

      const isLastItemsPage = itemIndex >= lineItems.length;
      const sections = [];

      if (isFirstPage) {
        sections.push({ type: 'meta' }, { type: 'parties' });
      }

      sections.push({ type: 'table', data: { items: currentItems } });

      if (isLastItemsPage) {
        sections.push({ type: 'totals' });
        if (terms.length) sections.push({ type: 'terms', data: { terms } });
        if (template.signatureBlock?.enabled) sections.push({ type: 'signature' });
      }

      pages.push({ pageBox, header: {}, footer: {}, sections });
      pageNumber += 1;
    }

    return pages;
  }

  #estimateMetaHeight(ctx) {
    const { document, fonts } = ctx;
    const rows = [
      ['Valid Until', document.dates?.validUntil || ''],
      ['Reference', document.metadata?.reference || ''],
      ['Subject', document.metadata?.subject || ''],
    ].filter(([, value]) => value);

    if (!rows.length) return 0;

    const labelWidth = 72;
    const available = 230;
    let lines = 0;
    for (const [, value] of rows) {
      lines += wrapText(fonts.regular, value, 9, available).length;
    }

    return 12 + Math.max(lines, rows.length) * 14 + 12;
  }

  #estimatePartiesHeight(ctx) {
    const { document, fonts, pageBox } = ctx;
    const leftWidth = (pageBox.width / 2) - 16;
    const issuerLines = [
      document.issuerSnapshot?.companyName,
      document.issuerSnapshot?.contactName,
      document.issuerSnapshot?.email,
      document.issuerSnapshot?.phone,
      document.issuerSnapshot?.address,
    ].filter(Boolean);
    const clientLines = [
      document.clientSnapshot?.companyName,
      document.clientSnapshot?.contactName,
      document.clientSnapshot?.email,
      document.clientSnapshot?.phone,
      document.clientSnapshot?.address,
    ].filter(Boolean);

    const estimateBlock = (lines) => lines.reduce((sum, line) => sum + (wrapText(fonts.regular, line, 9, leftWidth).length * 12), 0);
    return 16 + Math.max(estimateBlock(issuerLines), estimateBlock(clientLines)) + 18;
  }

  #estimateRowHeight(ctx, item) {
    const { template, fonts } = ctx;
    const columns = template.table?.columns || [];
    const descriptionColumn = columns.find((col) => col.key === 'description');
    const baseHeight = template.table?.rowHeight || 22;

    if (!descriptionColumn) return baseHeight;

    const width = Math.max(40, Number(descriptionColumn.width || 0) - 8);
    const lines = wrapText(fonts.regular, item?.description || '', 9, width).length;
    return Math.max(baseHeight, 10 + (lines * 12));
  }

  #estimateTotalsHeight() {
    return 72;
  }

  #estimateTermsHeight(ctx, terms) {
    const { fonts, pageBox } = ctx;
    const width = Math.min(pageBox.width, 360);
    let totalLines = 0;

    for (const term of terms) {
      totalLines += wrapText(fonts.regular, `• ${term}`, 9, width).length;
    }

    return 18 + 18 + (totalLines * 14) + 14;
  }

  #estimateSignatureHeight(ctx) {
    const { document, template, fonts, pageBox } = ctx;
    const block = template.signatureBlock;
    if (!block?.enabled) return 0;

    const metaWidth = Math.max(120, pageBox.width - 210);
    let lines = 1;

    if (block.showName && document.signature?.name) lines += wrapText(fonts.regular, `Name: ${document.signature.name}`, 9, metaWidth).length;
    if (block.showTitle && document.signature?.title) lines += wrapText(fonts.regular, `Title: ${document.signature.title}`, 9, metaWidth).length;
    if (block.showDate) lines += 1;

    return 42 + (lines * 14) + 22;
  }
}
