/** @file src/modules/documents/pdf/PdfDocumentRenderer.js */
import { PDFDocument } from 'pdf-lib';
import { createPageBox } from './layout/pageBox.js';

export class PdfDocumentRenderer {
  constructor({ assetLoader, headerRenderer, footerRenderer, sectionRenderer, stampRenderer }) {
    this.assetLoader = assetLoader;
    this.headerRenderer = headerRenderer;
    this.footerRenderer = footerRenderer;
    this.sectionRenderer = sectionRenderer;
    this.stampRenderer = stampRenderer;
  }

  async render({ document, pagePlan, theme }) {
    const pdfDoc = await PDFDocument.create();
    const fonts = await this.assetLoader.loadFonts(pdfDoc);

    const pageSize = pagePlan?.pageSize || document.layout?.page || { width: 794, height: 1123 };
    const margins = pagePlan?.margins || document.layout?.margins || { top: 40, right: 52, bottom: 40, left: 52 };
    const headerHeight = Number(pagePlan?.headerHeight ?? (theme.layout.header.enabled ? theme.layout.header.height : 0));
    const footerHeight = Number(pagePlan?.footerHeight ?? (theme.layout.footer.enabled ? theme.layout.footer.height : 0));

    for (const planPage of pagePlan.pages) {
      const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

      const pageBox = createPageBox({
        pageWidth: pageSize.width,
        pageHeight: pageSize.height,
        margins,
        headerHeight,
        footerHeight,
      });

      if (theme.layout.watermark.text) {
        this.stampRenderer.render({
          page,
          pageBox,
          text: theme.layout.watermark.text,
          opacity: theme.layout.watermark.opacity,
          rotation: theme.layout.watermark.rotation,
          fonts,
        });
      }

      if (theme.layout.header.enabled) {
        await this.headerRenderer.render({
          page,
          pdfDoc,
          pageBox,
          document,
          theme,
          fonts,
          assetLoader: this.assetLoader,
        });
      }

      let cursorY = pageBox.bodyTop;

      for (const section of planPage.sections) {
        cursorY = await this.sectionRenderer.render({
          page,
          pdfDoc,
          pageBox,
          section,
          document,
          theme,
          fonts,
          assetLoader: this.assetLoader,
          cursorY,
        });

        cursorY -= 10;
      }

      if (theme.layout.footer.enabled) {
        await this.footerRenderer.render({
          page,
          pageBox,
          theme,
          fonts,
          pageNumber: planPage.pageNumber,
          pageCount: planPage.pageCount,
        });
      }
    }

    return pdfDoc.save();
  }
}