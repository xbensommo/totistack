/** @file src/modules/documents/pdf/layout/measureText.js */
export function measureText(font, text, size) { return font.widthOfTextAtSize(String(text ?? ''), size); }
