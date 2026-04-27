/** @file src/modules/documents/pdf/utils/text.js */
export function toPdfLines(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toSinglePdfText(value) {
  return String(value ?? '')
    .replace(/\r\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ');
}