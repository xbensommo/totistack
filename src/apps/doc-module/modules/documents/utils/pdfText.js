import { rgb, degrees } from 'pdf-lib';

const CHAR_MAP = {
  '–': '-',
  '—': '-',
  '‘': "'",
  '’': "'",
  '‚': ',',
  '“': '"',
  '”': '"',
  '„': '"',
  '•': '•',
  '…': '...',
  '\u00A0': ' ',
};

export function toRgb(hex, fallback = '#0f172a') {
  const value = String(hex || fallback).trim();
  const normalized = value.startsWith('#') ? value.slice(1) : value;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return toRgb(fallback, '#0f172a');
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  return rgb(r, g, b);
}

export function normalizePdfText(value) {
  return Array.from(String(value ?? ''))
    .map((char) => {
      if (char === '\n') return '\n';
      if (CHAR_MAP[char]) return CHAR_MAP[char];

      const code = char.codePointAt(0);
      if (code >= 32 && code <= 255) return char;

      return ' ';
    })
    .join('')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

export function wrapText(font, text, fontSize, maxWidth) {
  const lines = [];
  const paragraphs = normalizePdfText(text).split('\n');

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    let current = '';

    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);

      if (width <= maxWidth || !current) {
        current = candidate;
        continue;
      }

      lines.push(current);
      current = word;
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines.length ? lines : [''];
}

export function drawWrappedText({
  page,
  font,
  text,
  x,
  y,
  maxWidth,
  fontSize = 10,
  lineHeight = 14,
  color,
}) {
  const lines = wrapText(font, text, fontSize, maxWidth);

  let currentY = y;

  for (const line of lines) {
    page.drawText(line || ' ', {
      x,
      y: currentY - fontSize,
      size: fontSize,
      font,
      color,
    });

    currentY -= lineHeight;
  }

  return currentY;
}

export function stripHtml(html) {
  return normalizePdfText(
    String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h1|h2|h3|blockquote)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  ).trim();
}

export function extractHtmlBlocks(html) {
  const source = String(html || '');
  const blocks = [];
  const pattern = /<(h1|h2|h3|p|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;

  const matches = Array.from(source.matchAll(pattern));

  if (!matches.length) {
    const text = stripHtml(source);
    return text ? [{ type: 'paragraph', text }] : [];
  }

  for (const match of matches) {
    const tag = String(match[1] || '').toLowerCase();
    const text = stripHtml(match[2] || '');

    if (!text) continue;

    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      blocks.push({ type: 'heading', text });
    } else if (tag === 'li') {
      blocks.push({ type: 'list-item', text });
    } else {
      blocks.push({ type: 'paragraph', text });
    }
  }

  return blocks;
}

export function drawHtmlBlock({
  page,
  fonts,
  html,
  x,
  y,
  width,
  textColor,
  headingColor,
}) {
  const blocks = extractHtmlBlocks(html);
  let currentY = y;

  for (const block of blocks) {
    if (block.type === 'heading') {
      currentY = drawWrappedText({
        page,
        font: fonts.bold,
        text: block.text,
        x,
        y: currentY,
        maxWidth: width,
        fontSize: 11,
        lineHeight: 15,
        color: headingColor,
      });
      currentY -= 2;
      continue;
    }

    const text = block.type === 'list-item' ? `• ${block.text}` : block.text;

    currentY = drawWrappedText({
      page,
      font: fonts.regular,
      text,
      x,
      y: currentY,
      maxWidth: width,
      fontSize: 10,
      lineHeight: 14,
      color: textColor,
    });
  }

  return currentY;
}

export function measureWrappedTextHeight(font, text, fontSize, lineHeight, maxWidth) {
  return wrapText(font, text, fontSize, maxWidth).length * lineHeight;
}

export function rotation(value) {
  return degrees(Number(value || 0));
}