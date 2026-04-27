/** @file src/modules/documents/pdf/renderers/TotalsRenderer.js */

import { toRgb, normalizePdfText } from '../../utils/pdfText.js';

export class TotalsRenderer {
  render({ page, section, pageBox, fonts, theme, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;
    const boxWidth = Math.min(320, width);
    const boxX = x + width - boxWidth;

    const accent = toRgb(theme.brand.accentColor, '#0f766e');
    const border = toRgb('#cbd5e1');
    const textColor = toRgb('#0f172a');
    const muted = toRgb('#475569');
    const white = toRgb('#ffffff');

    page.drawText(String(section.title || '').toUpperCase(), {
      x,
      y: cursorY - 10,
      size: 9,
      font: fonts.bold,
      color: accent,
    });

    const startY = cursorY - 26;
    const rows = [
      ['Subtotal', section.finance?.subtotalFormatted || String(section.finance?.subtotal || '')],
      [`Tax (${section.finance?.taxRate ?? 0}%)`, section.finance?.taxAmountFormatted || String(section.finance?.taxAmount || '')],
      ['Total', section.finance?.totalFormatted || String(section.finance?.total || '')],
    ];

    let currentY = startY;

    rows.forEach((row, index) => {
      const isLast = index === rows.length - 1;
      const rowHeight = 28;

      page.drawRectangle({
        x: boxX,
        y: currentY - rowHeight,
        width: boxWidth,
        height: rowHeight,
        borderWidth: 1,
        borderColor: border,
        color: isLast ? accent : undefined,
      });

      page.drawText(normalizePdfText(row[0]), {
        x: boxX + 12,
        y: currentY - 18,
        size: 10,
        font: isLast ? fonts.bold : fonts.regular,
        color: isLast ? white : muted,
      });

      const value = normalizePdfText(row[1]);
      const valueWidth = fonts.bold.widthOfTextAtSize(value, 10);

      page.drawText(value, {
        x: boxX + boxWidth - 12 - valueWidth,
        y: currentY - 18,
        size: 10,
        font: fonts.bold,
        color: isLast ? white : textColor,
      });

      currentY -= rowHeight;
    });

    return currentY;
  }
}