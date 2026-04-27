/** @file src/modules/documents/pdf/renderers/FooterRenderer.js */

import { toRgb, drawWrappedText } from '../../utils/pdfText.js';

export class FooterRenderer {
  async render({ page, pageBox, theme, fonts, pageNumber, pageCount }) {
    const x = pageBox.margins.left;
    const y = pageBox.margins.bottom + theme.layout.footer.height;
    const width = pageBox.pageWidth - pageBox.margins.left - pageBox.margins.right;

    const textColor = toRgb('#475569');
    const borderColor = toRgb('#cbd5e1');

    page.drawLine({
      start: { x, y },
      end: { x: x + width, y },
      thickness: 1,
      color: borderColor,
    });

    const columnWidth = (width - 24) / 3;

    drawWrappedText({
      page,
      font: fonts.regular,
      text: theme.layout.footer.leftText || '',
      x,
      y: y - 8,
      maxWidth: columnWidth,
      fontSize: 8,
      lineHeight: 10,
      color: textColor,
    });

    drawWrappedText({
      page,
      font: fonts.regular,
      text: theme.layout.footer.centerText || '',
      x: x + columnWidth + 12,
      y: y - 8,
      maxWidth: columnWidth,
      fontSize: 8,
      lineHeight: 10,
      color: textColor,
    });

    const rightText = theme.layout.footer.showPageNumbers
      ? `${theme.layout.footer.rightText || ''}${theme.layout.footer.rightText ? ' · ' : ''}Page ${pageNumber} of ${pageCount}`
      : theme.layout.footer.rightText || '';

    drawWrappedText({
      page,
      font: fonts.regular,
      text: rightText,
      x: x + (columnWidth * 2) + 24,
      y: y - 8,
      maxWidth: columnWidth,
      fontSize: 8,
      lineHeight: 10,
      color: textColor,
    });
  }
}