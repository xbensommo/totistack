/** @file src/modules/documents/pdf/renderers/SectionRenderer.js */
import {
  toRgb,
  drawWrappedText,
  drawHtmlBlock,
  measureWrappedTextHeight,
  normalizePdfText,
} from '../../utils/pdfText.js';

export class SectionRenderer {
  constructor({ tableRenderer, totalsRenderer, signatureRenderer }) {
    this.tableRenderer = tableRenderer;
    this.totalsRenderer = totalsRenderer;
    this.signatureRenderer = signatureRenderer;
  }

  async render(ctx) {
    const { section } = ctx;

    switch (section.kind) {
      case 'meta':
        return this.#renderMeta(ctx);
      case 'parties':
        return this.#renderParties(ctx);
      case 'summary':
      case 'rich-text':
      case 'notes':
        return this.#renderHtmlSection(ctx);
      case 'list':
        return this.#renderList(ctx);
      case 'table':
        return this.tableRenderer.render(ctx);
      case 'totals':
        return this.totalsRenderer.render(ctx);
      case 'signatures':
        return this.signatureRenderer.render(ctx);
      default:
        return ctx.cursorY;
    }
  }

  #drawSectionTitle({ page, fonts, theme, x, y, title }) {
    page.drawText(String(title || '').toUpperCase(), {
      x,
      y: y - 10,
      size: 9,
      font: fonts.bold,
      color: toRgb(theme.brand.accentColor, '#0f766e'),
    });

    return y - 26;
  }

  #renderMeta({ page, section, pageBox, fonts, theme, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;
    const titleY = this.#drawSectionTitle({ page, fonts, theme, x, y: cursorY, title: section.title });

    const gap = 12;
    const cardWidth = (width - (gap * 2)) / 3;
    const cards = [
      { label: 'Number', value: section.meta?.number || 'Draft' },
      { label: 'Status', value: section.meta?.status || 'draft' },
      { label: 'Issued On', value: section.meta?.issuedOn || '' },
    ];

    const border = toRgb('#ffffff');//toRgb('#cbd5e1');
    const muted = toRgb('#64748b');
    const textColor = toRgb('#0f172a');

    cards.forEach((card, index) => {
      const cardX = x + ((cardWidth + gap) * index);
      page.drawRectangle({
        x: cardX,
        y: titleY - 46,
        width: cardWidth,
        height: 46,
        borderWidth: 0,
       borderColor: border,
      });

      page.drawText(normalizePdfText(card.label), {
        x: cardX + 10,
        y: titleY - 14,
        size: 8,
        font: fonts.bold,
        color: muted,
      });

      page.drawText(normalizePdfText(card.value), {
        x: cardX + 10,
        y: titleY - 30,
        size: 10,
        font: fonts.bold,
        color: textColor,
      });
    });

    return titleY - 46;
  }

  #renderParties({ page, section, pageBox, fonts, theme, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;
    const titleY = this.#drawSectionTitle({ page, fonts, theme, x, y: cursorY, title: section.title });

    const gap = 16;
    const cardWidth = (width - gap) / 2;
    const border = toRgb('#ffffff');
    const muted = toRgb('#64748b');
    const textColor = toRgb('#0f172a');

    const issuerLines = [
      section.parties?.issuer?.companyName || '',
      section.parties?.issuer?.contactName || '',
      section.parties?.issuer?.email || '',
      section.parties?.issuer?.phone || '',
      section.parties?.issuer?.address || '',
    ].filter(Boolean);

    const clientLines = [
      section.parties?.client?.companyName || '',
      section.parties?.client?.contactName || '',
      section.parties?.client?.email || '',
      section.parties?.client?.phone || '',
      section.parties?.client?.address || '',
    ].filter(Boolean);

    const issuerHeight = 28 + issuerLines.reduce((sum, line, index) => {
      return sum + measureWrappedTextHeight(fonts.regular, line, index === 0 ? 10 : 9, 12, cardWidth - 20);
    }, 0) + 12;

    const clientHeight = 28 + clientLines.reduce((sum, line, index) => {
      return sum + measureWrappedTextHeight(fonts.regular, line, index === 0 ? 10 : 9, 12, cardWidth - 20);
    }, 0) + 12;

    const cardHeight = Math.max(issuerHeight, clientHeight, 90);

    this.#drawPartyCard({
      page,
      fonts,
      title: 'Issuer',
      lines: issuerLines,
      x,
      y: titleY,
      width: cardWidth,
      height: cardHeight,
      border,
      muted,
      textColor,
    });

    this.#drawPartyCard({
      page,
      fonts,
      title: 'Client',
      lines: clientLines,
      x: x + cardWidth + gap,
      y: titleY,
      width: cardWidth,
      height: cardHeight,
      border,
      muted,
      textColor,
    });

    return titleY - cardHeight;
  }

  #drawPartyCard({ page, fonts, title, lines, x, y, width, height, border, muted, textColor }) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      borderWidth: 1,
      borderColor: border,
    });

    page.drawText(title.toUpperCase(), {
      x: x + 10,
      y: y - 14,
      size: 8,
      font: fonts.bold,
      color: muted,
    });

    let currentY = y - 26;

    lines.forEach((line, index) => {
      currentY = drawWrappedText({
        page,
        font: index === 0 ? fonts.bold : fonts.regular,
        text: line,
        x: x + 10,
        y: currentY,
        maxWidth: width - 20,
        fontSize: index === 0 ? 10 : 9,
        lineHeight: 12,
        color: textColor,
      });
    });
  }

  #renderHtmlSection({ page, section, pageBox, fonts, theme, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;
    const titleY = this.#drawSectionTitle({ page, fonts, theme, x, y: cursorY, title: section.title });

    const border = toRgb('#ffffff');
    const textColor = toRgb('#0f172a');
    const accent = toRgb(theme.brand.accentColor, '#0f766e');

    const boxHeight = Math.max(80, this.#measureHtmlHeight(section.html || '', fonts, width - 24) + 18);

    page.drawRectangle({
      x,
      y: titleY - boxHeight,
      width,
      height: boxHeight,
      borderWidth: 1,
      borderColor: border,
    });

    const endY = drawHtmlBlock({
      page,
      fonts,
      html: section.html || '<p>—</p>',
      x: x + 12,
      y: titleY - 10,
      width: width - 24,
      textColor,
      headingColor: accent,
    });

    return Math.min(titleY - boxHeight, endY - 8);
  }

  #measureHtmlHeight(html, fonts, width) {
    const text = normalizePdfText(
      String(html || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h1|h2|h3|li|blockquote)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
    );

    return measureWrappedTextHeight(fonts.regular, text, 10, 14, width);
  }

  #renderList({ page, section, pageBox, fonts, theme, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;
    const titleY = this.#drawSectionTitle({ page, fonts, theme, x, y: cursorY, title: section.title });

    const border = toRgb('#ffffff');
    const headerBg = toRgb('#f8fafc');
    const muted = toRgb('#475569');
    const textColor = toRgb('#0f172a');

    const leftWidth = Math.max(180, width * 0.28);
    const rightWidth = width - leftWidth;
    const headerHeight = 24;

    page.drawRectangle({
      x,
      y: titleY - headerHeight,
      width: leftWidth,
      height: headerHeight,
      borderWidth: 1,
      borderColor: border,
      color: headerBg,
    });

    page.drawRectangle({
      x: x + leftWidth,
      y: titleY - headerHeight,
      width: rightWidth,
      height: headerHeight,
      borderWidth: 1,
      borderColor: border,
      color: headerBg,
    });

    page.drawText('ITEM', {
      x: x + 8,
      y: titleY - 16,
      size: 8,
      font: fonts.bold,
      color: muted,
    });

    page.drawText('DETAILS', {
      x: x + leftWidth + 8,
      y: titleY - 16,
      size: 8,
      font: fonts.bold,
      color: muted,
    });

    let currentY = titleY - headerHeight;

    (section.items || []).forEach((item) => {
      const leftValue = normalizePdfText(item.label || '');
      const rightValue = normalizePdfText(item.value || '');

      const rowHeight = Math.max(
        28,
        measureWrappedTextHeight(fonts.bold, leftValue, 9, 12, leftWidth - 16) + 10,
        measureWrappedTextHeight(fonts.regular, rightValue, 9, 12, rightWidth - 16) + 10
      );

      page.drawRectangle({
        x,
        y: currentY - rowHeight,
        width: leftWidth,
        height: rowHeight,
        borderWidth: 1,
        borderColor: border,
      });

      page.drawRectangle({
        x: x + leftWidth,
        y: currentY - rowHeight,
        width: rightWidth,
        height: rowHeight,
        borderWidth: 1,
        borderColor: border,
      });

      drawWrappedText({
        page,
        font: fonts.bold,
        text: leftValue,
        x: x + 8,
        y: currentY - 6,
        maxWidth: leftWidth - 16,
        fontSize: 9,
        lineHeight: 12,
        color: textColor,
      });

      drawWrappedText({
        page,
        font: fonts.regular,
        text: rightValue,
        x: x + leftWidth + 8,
        y: currentY - 6,
        maxWidth: rightWidth - 16,
        fontSize: 9,
        lineHeight: 12,
        color: textColor,
      });

      currentY -= rowHeight;
    });

    return currentY;
  }
}