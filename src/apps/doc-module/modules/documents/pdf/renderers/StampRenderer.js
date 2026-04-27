/** @file src/modules/documents/pdf/renderers/StampRenderer.js */

import { grayscale } from 'pdf-lib';
import { rotation } from '../../utils/pdfText.js';

export class StampRenderer {
  render({ page, pageBox, text, opacity = 0.08, rotation: angle = -35, fonts }) {
    if (!text) return;

    const fontSize = Math.max(42, Math.round(pageBox.pageWidth * 0.08));
    const width = fonts.bold.widthOfTextAtSize(String(text).toUpperCase(), fontSize);

    page.drawText(String(text).toUpperCase(), {
      x: (pageBox.pageWidth - width) / 2,
      y: (pageBox.pageHeight / 2) - (fontSize / 2),
      size: fontSize,
      font: fonts.bold,
      color: grayscale(0.65),
      rotate: rotation(angle),
      opacity,
    });
  }
}