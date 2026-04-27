import { createPrintableHtml } from './createPrintableHtml.js';
import { formatMoney } from '../utils/money.js';

export function openPrintPreview({ document, pagePlan, title }) {
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) {
    throw new Error('Print preview popup was blocked.');
  }

  const html = createPrintableHtml({
    document,
    pagePlan,
    title,
    formatMoney,
  });

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
}
