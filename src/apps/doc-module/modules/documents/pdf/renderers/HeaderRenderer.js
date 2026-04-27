/** @file src/modules/documents/pdf/renderers/HeaderRenderer.js */

import { toRgb, drawWrappedText } from '../../utils/pdfText.js';

export class HeaderRenderer {
  async render({ page, pdfDoc, pageBox, document, theme, fonts, assetLoader }) {
    const x = pageBox.margins.left;
    const y = pageBox.pageHeight - pageBox.margins.top;
    const width = pageBox.pageWidth - pageBox.margins.left - pageBox.margins.right;

    const primary = toRgb(theme.brand.primaryColor, '#0f172a');
    const accent = toRgb(theme.brand.accentColor, '#0f766e');
    const textColor = toRgb('#475569');
    const lightBorder = toRgb('#ffffff');
    const panelBg = toRgb('#f8fafc');

    const leftWidth = width * 0.64;
    const rightWidth = width - leftWidth - 16;

    page.drawLine({
      start: { x, y: y - theme.layout.header.height },
      end: { x: x + width, y: y - theme.layout.header.height },
      thickness: 1.2,
      color: primary,
    });

    const logoSize = 56;
    const logoX = x;
    const logoY = y - logoSize;

    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      borderWidth: 1,
      borderColor: lightBorder,
      color: panelBg,
    });

    if (theme.brand.logoUrl) {
      try {
        const image = await assetLoader.loadImage(pdfDoc, theme.brand.logoUrl);
        if (image) {
          page.drawImage(image, {
            x: logoX + 4,
            y: logoY + 4,
            width: logoSize - 8,
            height: logoSize - 8,
          });
        }
      } catch {
        page.drawText((theme.brand.companyName || 'BD').slice(0, 2).toUpperCase(), {
          x: logoX + 14,
          y: logoY + 20,
          size: 16,
          font: fonts.bold,
          color: accent,
        });
      }
    } else {
      page.drawText((theme.brand.companyName || 'BD').slice(0, 2).toUpperCase(), {
        x: logoX + 14,
        y: logoY + 20,
        size: 16,
        font: fonts.bold,
        color: accent,
      });
    }

    const brandX = logoX + logoSize + 14;
    drawWrappedText({
      page,
      font: fonts.bold,
      text: theme.brand.companyName || '',
      x: brandX,
      y: y - 2,
      maxWidth: leftWidth - logoSize - 14,
      fontSize: 16,
      lineHeight: 20,
      color: primary,
    });

    drawWrappedText({
      page,
      font: fonts.regular,
      text: theme.layout.header.leftText || theme.brand.legalLine || '',
      x: brandX,
      y: y - 26,
      maxWidth: leftWidth - logoSize - 14,
      fontSize: 9,
      lineHeight: 12,
      color: textColor,
    });

    const rightX = x + leftWidth + 16;
    drawWrappedText({
      page,
      font: fonts.bold,
      text: document.meta?.title || '',
      x: rightX,
      y: y - 2,
      maxWidth: rightWidth,
      fontSize: 9,
      lineHeight: 12,
      color: accent,
    });

    drawWrappedText({
      page,
      font: fonts.bold,
      text: document.meta?.number || 'DRAFT',
      x: rightX,
      y: y - 24,
      maxWidth: rightWidth,
      fontSize: 15,
      lineHeight: 18,
      color: primary,
    });

    drawWrappedText({
      page,
      font: fonts.regular,
      text: theme.layout.header.rightText || theme.brand.contactLine || '',
      x: rightX,
      y: y - 44,
      maxWidth: rightWidth,
      fontSize: 7,
      lineHeight: 12,
      color: textColor,
    });
  }
}