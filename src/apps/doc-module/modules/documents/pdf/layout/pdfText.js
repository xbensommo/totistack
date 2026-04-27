/** @file src/modules/documents/pdf/layout/pdfText.js */

/**
 * Normalizes text for pdf-lib StandardFonts so unsupported characters do not
 * break layout or render as garbage.
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizePdfText(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u25CF\u25E6]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Wraps text by width with explicit line break support.
 * @param {import('pdf-lib').PDFFont} font
 * @param {unknown} value
 * @param {number} size
 * @param {number} maxWidth
 * @returns {string[]}
 */
export function wrapPdfText(font, value, size, maxWidth) {
  const safeWidth = Math.max(12, Number(maxWidth || 0));
  const normalized = sanitizePdfText(value);
  const paragraphs = normalized.split('\n');
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= safeWidth) {
        current = candidate;
        continue;
      }

      if (current) lines.push(current);

      if (font.widthOfTextAtSize(word, size) <= safeWidth) {
        current = word;
        continue;
      }

      let fragment = '';
      for (const char of word) {
        const next = `${fragment}${char}`;
        if (font.widthOfTextAtSize(next, size) <= safeWidth) {
          fragment = next;
        } else {
          if (fragment) lines.push(fragment);
          fragment = char;
        }
      }
      current = fragment;
    }

    if (current) lines.push(current);
  }

  return lines.length ? lines : [''];
}

/**
 * Draws wrapped text and returns the next Y position.
 * @param {object} params
 * @param {import('pdf-lib').PDFPage} params.page
 * @param {import('pdf-lib').PDFFont} params.font
 * @param {import('pdf-lib').Color} params.color
 * @param {unknown} params.text
 * @param {number} params.x
 * @param {number} params.y
 * @param {number} params.size
 * @param {number} params.maxWidth
 * @param {number} [params.lineHeight]
 * @param {'left'|'right'} [params.align]
 * @param {number} [params.maxLines]
 * @returns {{ lines: string[], y: number }}
 */
export function drawWrappedPdfText({
  page,
  font,
  color,
  text,
  x,
  y,
  size,
  maxWidth,
  lineHeight = Math.round(size * 1.45),
  align = 'left',
  maxLines,
}) {
  const wrapped = wrapPdfText(font, text, size, maxWidth);
  const lines = typeof maxLines === 'number' ? wrapped.slice(0, Math.max(1, maxLines)) : wrapped;
  let cursorY = y;

  for (const line of lines) {
    const drawX = align === 'right'
      ? x + maxWidth - font.widthOfTextAtSize(line, size)
      : x;

    page.drawText(line, {
      x: drawX,
      y: cursorY,
      size,
      font,
      color,
    });

    cursorY -= lineHeight;
  }

  return { lines, y: cursorY };
}
