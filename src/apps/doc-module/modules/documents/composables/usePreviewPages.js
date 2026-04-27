/** @file src/modules/documents/composables/usePreviewPages.js */
import { computed, unref } from 'vue';
import { createPageBox } from '../pdf/layout/pageBox.js';

function estimateWrappedLines(value, charsPerLine = 42) {
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

function estimateTableRowHeight(item) {
  return Math.max(24, 12 + (estimateWrappedLines(item?.description, 42) * 12));
}

function estimateTermsHeight(terms = []) {
  if (!terms.length) return 0;
  const lines = terms.reduce((sum, term) => sum + estimateWrappedLines(term, 54), 0);
  return 38 + (lines * 12) + (terms.length * 4);
}

function estimateSignatureHeight(enabled) {
  return enabled ? 110 : 0;
}

function estimateSummaryHeight(document, template) {
  const totalsHeight = 112;
  const termsHeight = estimateTermsHeight(document?.terms || []);
  const signatureHeight = estimateSignatureHeight(template?.signatureBlock?.enabled);
  return Math.max(160, termsHeight, totalsHeight + signatureHeight + 16);
}

export function usePreviewPages({ document, template, zoom }) {
  const previewPages = computed(() => {
    const effectiveDocument = unref(document) ?? {};
    const effectiveTemplate = unref(template) ?? {};

    const margins = effectiveTemplate?.page?.margin ?? {
      top: 48,
      right: 40,
      bottom: 48,
      left: 40,
    };

    const headerHeight = effectiveTemplate?.header?.enabled
      ? (effectiveTemplate?.header?.height ?? 0)
      : 0;

    const footerHeight = effectiveTemplate?.footer?.enabled
      ? (effectiveTemplate?.footer?.height ?? 0)
      : 0;

    const pageBox = createPageBox({
      pageWidth: 595.28,
      pageHeight: 841.89,
      margins,
      headerHeight,
      footerHeight,
    });

    const items = Array.isArray(effectiveDocument?.lineItems)
      ? effectiveDocument.lineItems
      : [];

    const pages = [];
    const tableHeaderHeight = effectiveTemplate?.table?.headerHeight ?? 24;
    const firstPageStatic = 124 + tableHeaderHeight;
    const continuationStatic = 22 + tableHeaderHeight;
    const summaryHeight = estimateSummaryHeight(effectiveDocument, effectiveTemplate);

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
          continue;
        }

        break;
      }

      const showSummary = index >= items.length && used + summaryHeight <= availableHeight;

      pages.push({
        kind: first ? 'items-first' : 'items-continuation',
        items: pageItems,
        showSummary,
      });

      first = false;
    }

    if (!pages.length) {
      pages.push({
        kind: 'items-first',
        items: [],
        showSummary: true,
      });
    }

    if (!pages[pages.length - 1]?.showSummary) {
      pages.push({
        kind: 'summary',
        items: [],
        showSummary: true,
      });
    }

    return pages;
  });

  const pageScaleStyle = computed(() => {
    const resolvedZoom = Number(unref(zoom) ?? 0.8);

    return {
      transform: `scale(${resolvedZoom})`,
      transformOrigin: 'top center',
    };
  });

  return {
    previewPages,
    pageScaleStyle,
  };
}