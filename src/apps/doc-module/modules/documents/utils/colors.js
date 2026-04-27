/** @file src/modules/documents/utils/colors.js */
import { rgb } from 'pdf-lib';
export function hexToRgb(hex = '#000000') {
  const safe = hex.replace('#', '');
  const normalized = safe.length === 3 ? safe.split('').map((part) => `${part}${part}`).join('') : safe;
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return rgb(r || 0, g || 0, b || 0);
}
