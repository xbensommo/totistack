/**
 * @file src/modules/documents/composables/usePdfExport.js
 * Shared PDF export and preview pagination utilities.
 */

import { ref, onBeforeUnmount } from 'vue';
import { PdfDocumentRenderer } from '../pdf/PdfDocumentRenderer.js';
import { PdfAssetLoader } from '../pdf/assets/PdfAssetLoader.js';
import { createPageBox } from '../pdf/layout/pageBox.js';
import { HeaderRenderer } from '../pdf/renderers/HeaderRenderer.js';
import { FooterRenderer } from '../pdf/renderers/FooterRenderer.js';
import { SectionRenderer } from '../pdf/renderers/SectionRenderer.js';
import { TableRenderer } from '../pdf/renderers/TableRenderer.js';
import { TotalsRenderer } from '../pdf/renderers/TotalsRenderer.js';
import { TermsRenderer } from '../pdf/renderers/TermsRenderer.js';
import { SignatureSectionRenderer } from '../pdf/renderers/SignatureSectionRenderer.js';
import { StampRenderer } from '../pdf/renderers/StampRenderer.js';

/**
 * Estimates line wrapping for plain text content.
 * @param {unknown} value
 * @param {number} [charsPerLine=42]
 * @returns {number}
 */
export function estimateWrappedLines(value, charsPerLine = 42) {
  const paragraphs = String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  let total = 0;
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      total += 1;
      continue;
    }

    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= charsPerLine) {
        line = candidate;
      } else {
        total += 1;
        line = word;
      }
    }

    if (line) total += 1;
  }

  return Math.max(total, 1);
}

/**
 * Estimates the rendered table row height for a line item.
 * @param {Record<string, any>} [item={}]
 * @returns {number}
 */
export function estimateTableRowHeight(item = {}) {
  return Math.max(24, 12 + (estimateWrappedLines(item.description, 42) * 12));
}

/**
 * Estimates the rendered terms block height.
 * @param {string[]} [terms=[]]
 * @returns {number}
 */
export function estimateTermsHeight(terms = []) {
  if (!terms.length) return 0;
  const lines = terms.reduce((sum, term) => sum + estimateWrappedLines(term, 54), 0);
  return 38 + (lines * 12) + (terms.length * 4);
}

/**
 * Converts payment details to PDF-safe text lines without introducing a new renderer.
 * This keeps the existing renderer stack intact.
 * @param {Record<string, any>} [payment={}]
 * @returns {string[]}
 */
export function buildPaymentTerms(payment = {}) {
  const terms = [];
  const instructions = String(payment.instructions || '').trim();
  const bankName = String(payment.bankName || '').trim();
  const accountName = String(payment.accountName || '').trim();
  const accountNumber = String(payment.accountNumber || '').trim();
  const branchCode = String(payment.branchCode || '').trim();

  if (instructions || bankName || accountName || accountNumber || branchCode) {
    terms.push('Payment Details');
    if (instructions) terms.push(instructions);
    if (bankName) terms.push(`Bank: ${bankName}`);
    if (accountName) terms.push(`Account Name: ${accountName}`);
    if (accountNumber) terms.push(`Account Number: ${accountNumber}`);
    if (branchCode) terms.push(`Branch Code: ${branchCode}`);
  }

  return terms;
}

/**
 * Determines whether the document has payment content worth exporting.
 * @param {Record<string, any>} [document={}]
 * @returns {boolean}
 */
export function hasPaymentDetails(document = {}) {
  return buildPaymentTerms(document.payment).length > 0;
}

/**
 * Estimates payment content height in the summary column.
 * @param {Record<string, any>} [document={}]
 * @returns {number}
 */
export function estimatePaymentHeight(document = {}) {
  const lines = buildPaymentTerms(document.payment);
  if (!lines.length) return 0;
  const wrappedLines = lines.reduce((sum, line) => sum + estimateWrappedLines(line, 48), 0);
  return 40 + (wrappedLines * 12) + 12;
}

/**
 * Returns a clone of the document tailored for the existing PDF renderers.
 * Payment details are appended into terms so the exported PDF includes them
 * without requiring a new PDF renderer contract.
 * @param {Record<string, any>} document
 * @returns {Record<string, any>}
 */
export function normalizePdfDocument(document) {
  const paymentTerms = buildPaymentTerms(document?.payment || {});
  if (!paymentTerms.length) {
    return { ...document };
  }

  return {
    ...document,
    terms: [...(Array.isArray(document?.terms) ? document.terms : []), ...paymentTerms],
  };
}

/**
 * Estimates the combined summary block height.
 * @param {Record<string, any>} document
 * @param {Record<string, any>} template
 * @returns {number}
 */
export function estimateSummaryHeight(document, template) {
  const exportDocument = normalizePdfDocument(document);
  const totalsHeight = 112;
  const termsHeight = estimateTermsHeight(exportDocument?.terms || []);
  const signatureHeight = template?.signatureBlock?.enabled ? 110 : 0;
  const paymentHeight = estimatePaymentHeight(document);
  return Math.max(160, termsHeight, totalsHeight + signatureHeight + paymentHeight + 16);
}

/**
 * Shared paginator used by the PDF renderer.
 */
class EquilibriumPdfPaginator {
  /**
   * @param {{template: Record<string, any>, pageWidth: number, pageHeight: number, margins: Record<string, number>, document: Record<string, any>}} ctx
   * @returns {Array<Record<string, any>>}
   */
  paginate(ctx) {
    const template = ctx.template;
    const pageBox = createPageBox({
      pageWidth: ctx.pageWidth,
      pageHeight: ctx.pageHeight,
      margins: ctx.margins,
      headerHeight: template.header?.enabled ? template.header.height : 0,
      footerHeight: template.footer?.enabled ? template.footer.height : 0,
    });

    const exportDocument = normalizePdfDocument(ctx.document);
    const lineItems = exportDocument.lineItems || [];
    const summaryHeight = estimateSummaryHeight(exportDocument, template);
    const firstPageStatic = 124;
    const continuationStatic = 22;
    const tableHeaderHeight = template.table?.headerHeight || 24;
    const pages = [];

    let index = 0;
    let isFirstPage = true;

    if (!lineItems.length) {
      pages.push(this.#buildItemsPage({ pageBox, items: [], includeMeta: true, showSummary: true }));
      return pages;
    }

    while (index < lineItems.length) {
      const staticHeight = (isFirstPage ? firstPageStatic : continuationStatic) + tableHeaderHeight;
      const availableHeight = pageBox.height - staticHeight;
      const pageItems = [];
      let usedHeight = 0;

      while (index < lineItems.length) {
        const rowHeight = estimateTableRowHeight(lineItems[index]);
        const remainingItems = lineItems.length - index - 1;
        const reserveForSummary = remainingItems === 0 ? summaryHeight + 12 : 0;

        if (usedHeight + rowHeight + reserveForSummary <= availableHeight || pageItems.length === 0) {
          pageItems.push(lineItems[index]);
          usedHeight += rowHeight;
          index += 1;
          continue;
        }

        break;
      }

      const isLastItemsPage = index >= lineItems.length;
      pages.push(this.#buildItemsPage({
        pageBox,
        items: pageItems,
        includeMeta: isFirstPage,
        showSummary: isLastItemsPage && usedHeight + summaryHeight <= availableHeight,
      }));

      isFirstPage = false;
    }

    const lastPage = pages[pages.length - 1];
    if (!lastPage.showSummary) {
      pages.push({
        pageBox,
        header: {},
        footer: {},
        sections: [
          { type: 'totals' },
          { type: 'terms', data: { terms: exportDocument.terms || [] } },
          ...(template.signatureBlock?.enabled ? [{ type: 'signature' }] : []),
        ],
        showSummary: true,
      });
    } else {
      lastPage.sections.push(
        { type: 'totals' },
        { type: 'terms', data: { terms: exportDocument.terms || [] } },
      );
      if (template.signatureBlock?.enabled) {
        lastPage.sections.push({ type: 'signature' });
      }
    }

    return pages;
  }

  /**
   * @param {{pageBox: Record<string, any>, items: Array<Record<string, any>>, includeMeta: boolean, showSummary: boolean}} options
   * @returns {Record<string, any>}
   */
  #buildItemsPage({ pageBox, items, includeMeta, showSummary }) {
    return {
      pageBox,
      header: {},
      footer: {},
      sections: [
        ...(includeMeta ? [{ type: 'meta' }, { type: 'parties' }] : []),
        { type: 'table', data: { items } },
      ],
      showSummary,
    };
  }
}

/**
 * Builds preview pagination data that matches the PDF pagination strategy.
 * @param {{template: Record<string, any>, document: Record<string, any>}} params
 * @returns {Array<{kind: 'items-first' | 'items-continuation' | 'summary', items?: Array<Record<string, any>>, showSummary: boolean}>}
 */
export function buildPreviewPages({ template, document }) {
  const pageBox = createPageBox({
    pageWidth: 595.28,
    pageHeight: 841.89,
    margins: template.page.margin,
    headerHeight: template.header?.enabled ? template.header.height : 0,
    footerHeight: template.footer?.enabled ? template.footer.height : 0,
  });

  const items = document.lineItems || [];
  const pages = [];
  const summaryHeight = estimateSummaryHeight(document, template);
  const tableHeaderHeight = template.table?.headerHeight || 24;
  const firstPageStatic = 124 + tableHeaderHeight;
  const continuationStatic = 22 + tableHeaderHeight;

  let index = 0;
  let first = true;
  while (index < items.length) {
    const availableHeight = pageBox.height - (first ? firstPageStatic : continuationStatic);
    const pageItems = [];
    let used = 0;

    while (index < items.length) {
      const rowHeight = estimateTableRowHeight(items[index]);
      const remainingItems = items.length - index - 1;
      const reserveForSummary = remainingItems === 0 ? summaryHeight + 12 : 0;
      if (used + rowHeight + reserveForSummary <= availableHeight || pageItems.length === 0) {
        pageItems.push(items[index]);
        used += rowHeight;
        index += 1;
      } else {
        break;
      }
    }

    const showSummary = index >= items.length && used + summaryHeight <= availableHeight;
    pages.push({ kind: first ? 'items-first' : 'items-continuation', items: pageItems, showSummary });
    first = false;
  }

  if (!pages.length) {
    pages.push({ kind: 'items-first', items: [], showSummary: true });
  }
  if (!pages[pages.length - 1].showSummary) {
    pages.push({ kind: 'summary', showSummary: true });
  }

  return pages;
}

/**
 * Creates a fully wired document renderer using existing renderers.
 * @returns {PdfDocumentRenderer}
 */
function createRenderer() {
  const tableRenderer = new TableRenderer();
  const totalsRenderer = new TotalsRenderer();
  const termsRenderer = new TermsRenderer();
  const signatureRenderer = new SignatureSectionRenderer();
  const sectionRenderer = new SectionRenderer({
    tableRenderer,
    totalsRenderer,
    termsRenderer,
    signatureRenderer,
  });

  return new PdfDocumentRenderer({
    assetLoader: new PdfAssetLoader(),
    paginator: new EquilibriumPdfPaginator(),
    headerRenderer: new HeaderRenderer(),
    footerRenderer: new FooterRenderer(),
    sectionRenderer,
    stampRenderer: new StampRenderer(),
  });
}

/**
 * Exposes a simple PDF export workflow for document pages.
 * @param {{template: import('vue').ComputedRef<Record<string, any>>, document: import('vue').ComputedRef<Record<string, any>>, fileName: import('vue').ComputedRef<string>}} params
 * @returns {{loading: import('vue').Ref<boolean>, error: import('vue').Ref<string>, pdfUrl: import('vue').Ref<string>, downloadName: () => string, generatePdfFile: () => Promise<void>}}
 */
export function usePdfExport({ template, document, fileName }) {
  const loading = ref(false);
  const error = ref('');
  const pdfUrl = ref('');

  async function generatePdfFile() {
    loading.value = true;
    error.value = '';

    try {
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = '';
      }

      const renderer = createRenderer();
      const bytes = await renderer.render({
        template: template.value,
        document: normalizePdfDocument(document.value),
      });

      pdfUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  }

  const downloadName = () => `${String(fileName?.value || 'document').replace(/[^\w-]+/g, '_')}.pdf`;

  onBeforeUnmount(() => {
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
    }
  });

  return {
    loading,
    error,
    pdfUrl,
    downloadName,
    generatePdfFile,
  };
}
