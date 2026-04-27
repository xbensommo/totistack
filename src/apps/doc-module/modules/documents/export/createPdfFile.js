import { PdfDocumentRenderer } from '../pdf/PdfDocumentRenderer.js';
import { PdfAssetLoader } from '../pdf/assets/PdfAssetLoader.js';
import { HeaderRenderer } from '../pdf/renderers/HeaderRenderer.js';
import { FooterRenderer } from '../pdf/renderers/FooterRenderer.js';
import { SectionRenderer } from '../pdf/renderers/SectionRenderer.js';
import { TableRenderer } from '../pdf/renderers/TableRenderer.js';
import { TotalsRenderer } from '../pdf/renderers/TotalsRenderer.js';
import { SignatureSectionRenderer } from '../pdf/renderers/SignatureSectionRenderer.js';
import { StampRenderer } from '../pdf/renderers/StampRenderer.js';

function createTheme(document) {
  return {
    brand: {
      companyName: document.brand?.companyName || '',
      primaryColor: document.brand?.primaryColor || '#0f172a',
      accentColor: document.brand?.accentColor || '#0f766e',
      legalLine: document.brand?.legalLine || '',
      contactLine: document.brand?.contactLine || '',
      logoUrl: document.brand?.logoFileUrl || document.brand?.logoUrl || '',
    }, 
    layout: {
      header: {
        enabled: Boolean(document.layout?.header?.enabled),
        height: Number(document.layout?.header?.height || 88),
        leftText: document.layout?.header?.leftText || '',
        rightText: document.layout?.header?.rightText || '',
      },
      footer: {
        enabled: Boolean(document.layout?.footer?.enabled),
        height: Number(document.layout?.footer?.height || 44),
        leftText: document.layout?.footer?.leftText || '',
        centerText: document.layout?.footer?.centerText || '',
        rightText: document.layout?.footer?.rightText || '',
        showPageNumbers: document.layout?.footer?.showPageNumbers !== false,
      },
      watermark: {
        text: document.layout?.watermark?.text || '',
        opacity: Number(document.layout?.watermark?.opacity ?? 0.08),
        rotation: Number(document.layout?.watermark?.rotation ?? -35),
      },
    },
  };
}

function createRenderer() {
  const tableRenderer = new TableRenderer();
  const totalsRenderer = new TotalsRenderer();
  const signatureRenderer = new SignatureSectionRenderer();

  const sectionRenderer = new SectionRenderer({
    tableRenderer,
    totalsRenderer,
    signatureRenderer,
  });

  return new PdfDocumentRenderer({
    assetLoader: new PdfAssetLoader(),
    headerRenderer: new HeaderRenderer(),
    footerRenderer: new FooterRenderer(),
    sectionRenderer,
    stampRenderer: new StampRenderer(),
  });
}

export async function createBusinessDocumentPdfBytes({ document, pagePlan }) {
  const renderer = createRenderer();
  return renderer.render({
    document,
    pagePlan,
    theme: createTheme(document),
  });
}

export async function createBusinessDocumentPdfUrl({ document, pagePlan }) {
  const bytes = await createBusinessDocumentPdfBytes({ document, pagePlan });
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}