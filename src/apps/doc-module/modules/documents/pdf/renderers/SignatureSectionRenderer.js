/** @file src/modules/documents/pdf/renderers/SignatureSectionRenderer.js */
import { toRgb, drawWrappedText, measureWrappedTextHeight } from '../../utils/pdfText.js';

function getSignatureSource(signature) {
  return signature?.imageUrl || signature?.drawnDataUrl || '';
}

export class SignatureSectionRenderer {
  async render({ page, pdfDoc, section, pageBox, fonts, theme, assetLoader, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;
    const gap = 16;
    const panelWidth = (width - gap) / 2;

    const accent = toRgb(theme.brand.accentColor, '#0f766e');
    const border = toRgb('#cbd5e1');
    const muted = toRgb('#475569');
    const textColor = toRgb('#0f172a');

    page.drawText(String(section.title || '').toUpperCase(), {
      x,
      y: cursorY - 10,
      size: 9,
      font: fonts.bold,
      color: accent,
    });

    const issuer = section.signatures?.issuer || {};
    const client = section.signatures?.client || {};

    const leftHeight = this.#measurePanelHeight(issuer, fonts, panelWidth);
    const rightHeight = this.#measurePanelHeight(client, fonts, panelWidth);
    const panelHeight = Math.max(leftHeight, rightHeight, 120);
    const topY = cursorY - 26;

    await this.#drawPanel({
      page,
      pdfDoc,
      signature: issuer,
      x,
      topY,
      width: panelWidth,
      height: panelHeight,
      fonts,
      border,
      muted,
      textColor,
      assetLoader,
    });

    await this.#drawPanel({
      page,
      pdfDoc,
      signature: client,
      x: x + panelWidth + gap,
      topY,
      width: panelWidth,
      height: panelHeight,
      fonts,
      border,
      muted,
      textColor,
      assetLoader,
    });

    return topY - panelHeight;
  }

  #measurePanelHeight(signature, fonts, width) {
    const contentWidth = width - 24;
    const blocks = [
      signature?.name || '',
      signature?.title || '',
      signature?.signedOn || '',
    ].filter(Boolean);

    const textHeight = blocks.reduce((sum, line, index) => {
      return sum + measureWrappedTextHeight(fonts.regular, line, index === 0 ? 10 : 9, 12, contentWidth);
    }, 0);

    const imageHeight = getSignatureSource(signature) ? 56 : (signature?.initials ? 18 : 0);
    return 30 + textHeight + imageHeight + 24;
  }

  async #drawPanel({ page, pdfDoc, signature, x, topY, width, height, fonts, border, muted, textColor, assetLoader }) {
    page.drawRectangle({
      x,
      y: topY - height,
      width,
      height,
      borderWidth: 1,
      borderColor: border,
    });

    page.drawText(signature?.name ? 'SIGNATORY' : 'PENDING', {
      x: x + 12,
      y: topY - 16,
      size: 8,
      font: fonts.bold,
      color: muted,
    });

    let currentY = topY - 28;

    currentY = drawWrappedText({
      page,
      font: fonts.bold,
      text: signature?.name || '—',
      x: x + 12,
      y: currentY,
      maxWidth: width - 24,
      fontSize: 10,
      lineHeight: 13,
      color: textColor,
    });

    currentY = drawWrappedText({
      page,
      font: fonts.regular,
      text: signature?.title || '—',
      x: x + 12,
      y: currentY,
      maxWidth: width - 24,
      fontSize: 9,
      lineHeight: 12,
      color: textColor,
    });

    currentY = drawWrappedText({
      page,
      font: fonts.regular,
      text: signature?.signedOn || '',
      x: x + 12,
      y: currentY,
      maxWidth: width - 24,
      fontSize: 9,
      lineHeight: 12,
      color: muted,
    });

    const source = getSignatureSource(signature);

    if (source) {
      try {
        const image = await assetLoader.loadImage(pdfDoc, source);
        if (image) {
          page.drawImage(image, {
            x: x + 12,
            y: Math.max(topY - height + 12, currentY - 54),
            width: Math.min(160, width - 24),
            height: 48,
          });
        }
      } catch {
        // ignore image load failure
      }
    } else if (signature?.initials) {
      page.drawText(String(signature.initials), {
        x: x + 12,
        y: Math.max(topY - height + 18, currentY - 18),
        size: 12,
        font: fonts.bold,
        color: textColor,
      });
    }
  }
}