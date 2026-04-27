/** @file src/modules/documents/pdf/renderers/TermsRenderer.js */
import { hexToRgb } from '../../utils/colors.js';
import { drawWrappedPdfText, sanitizePdfText } from '../layout/pdfText.js';

export class TermsRenderer {
  render(ctx, data = {}) {
    const { page, document, cursor, fonts, template, pageBox } = ctx;
    const terms = Array.isArray(data.terms) && data.terms.length
      ? data.terms
      : Array.isArray(document.terms)
        ? document.terms
        : [];

    if (!terms.length) return;

    const titleColor = hexToRgb(template.branding.primaryColor);
    const textColor = hexToRgb(template.branding.textColor);

    page.drawText(sanitizePdfText(data.title || 'Terms & Conditions'), {
      x: cursor.x,
      y: cursor.y,
      size: 11,
      font: fonts.bold,
      color: titleColor,
    });

    let y = cursor.y - 18;
    for (const term of terms) {
      const result = drawWrappedPdfText({
        page,
        font: fonts.regular,
        color: textColor,
        text: `- ${sanitizePdfText(term)}`,
        x: cursor.x,
        y,
        size: 9,
        maxWidth: pageBox.width,
        lineHeight: 14,
      });
      y = result.y - 2;
    }

    ctx.cursor.y = y - 12;
  }
}
