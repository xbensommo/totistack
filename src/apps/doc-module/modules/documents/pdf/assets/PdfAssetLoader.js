/** @file src/modules/documents/pdf/assets/PdfAssetLoader.js */

import { StandardFonts } from 'pdf-lib';

function dataUrlToBytes(dataUrl) {
  const [, base64 = ''] = String(dataUrl || '').split(',');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function urlToBytes(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function resolveImageBytes(source) {
  if (!source) return null;
  if (String(source).startsWith('data:')) return dataUrlToBytes(source);
  return urlToBytes(source);
}

export class PdfAssetLoader {
  async loadFonts(pdfDoc) {
    const [regular, bold] = await Promise.all([
      pdfDoc.embedFont(StandardFonts.Helvetica),
      pdfDoc.embedFont(StandardFonts.HelveticaBold),
    ]);

    return { regular, bold };
  }

  async loadImage(pdfDoc, source) {
    const bytes = await resolveImageBytes(source);
    if (!bytes) return null;

    const lower = String(source || '').toLowerCase();

    if (lower.includes('image/png') || lower.endsWith('.png')) {
      return pdfDoc.embedPng(bytes);
    }

    return pdfDoc.embedJpg(bytes);
  }
}