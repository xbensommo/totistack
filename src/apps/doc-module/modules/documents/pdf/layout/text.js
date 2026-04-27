/** @file src/modules/documents/pdf/layout/text.js */
export function normalizePdfText(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function splitExplicitLines(value) {
  return normalizePdfText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toSingleLinePdfText(value) {
  return normalizePdfText(value).replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export function wrapText(font, text, size, maxWidth) {
  const explicitLines = splitExplicitLines(text);
  if (!explicitLines.length) return [''];
  if (!maxWidth || maxWidth <= 0) return explicitLines;

  const wrapped = [];
  for (const explicitLine of explicitLines) {
    const words = explicitLine.split(/\s+/).filter(Boolean);
    if (!words.length) {
      wrapped.push('');
      continue;
    }

    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const candidateWidth = font.widthOfTextAtSize(candidate, size);
      if (candidateWidth <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        wrapped.push(current);
        current = '';
      }

      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
        continue;
      }

      let segment = '';
      for (const char of word) {
        const segmentCandidate = segment + char;
        if (font.widthOfTextAtSize(segmentCandidate, size) <= maxWidth) {
          segment = segmentCandidate;
        } else {
          if (segment) wrapped.push(segment);
          segment = char;
        }
      }
      current = segment;
    }

    if (current) wrapped.push(current);
  }

  return wrapped.length ? wrapped : [''];
}

export function getLineBlockHeight(lineCount, lineHeight, padding = 0) {
  const safeCount = Math.max(1, Number(lineCount) || 1);
  return (safeCount * lineHeight) + padding;
}
