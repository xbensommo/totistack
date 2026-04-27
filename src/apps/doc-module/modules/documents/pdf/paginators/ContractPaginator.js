/** @file src/modules/documents/pdf/paginators/ContractPaginator.js */
import { parseRichTextHtml, wrapRichTextRuns } from '../../utils/contractRichText.js';
import { createPageBox } from '../layout/pageBox.js';
import { estimateContractIntroHeight, estimateContractSignatureHeight } from '../renderers/ContractContentRenderer.js';

export class ContractPaginator {
  paginate(ctx) {
    const template = ctx.template;
    const pageBox = createPageBox({
      pageWidth: ctx.pageWidth,
      pageHeight: ctx.pageHeight,
      margins: ctx.margins,
      headerHeight: template.header?.enabled ? template.header.height : 0,
      footerHeight: template.footer?.enabled ? template.footer.height : 0,
    });

    const introHeight = estimateContractIntroHeight(ctx);
    const signatureHeight = estimateContractSignatureHeight(ctx);
    const renderableBlocks = this.#createRenderableBlocks(ctx, pageBox.width);
    const pages = [];

    let currentPage = this.#createPage(pageBox, pages.length === 0);
    let remainingHeight = pageBox.height - (currentPage.includeIntro ? introHeight : 0);

    for (const block of renderableBlocks) {
      const prepared = { ...block };
      const blockHeight = this.#getBlockHeight(prepared);

      if (!prepared.splittable && blockHeight > remainingHeight && currentPage.blocks.length) {
        pages.push(this.#finalizePage(currentPage));
        currentPage = this.#createPage(pageBox, false);
        remainingHeight = pageBox.height;
      }

      if (this.#getBlockHeight(prepared) <= remainingHeight) {
        currentPage.blocks.push(prepared);
        remainingHeight -= this.#getBlockHeight(prepared);
        continue;
      }

      let remainingLines = [...prepared.lines];
      let firstChunk = true;
      while (remainingLines.length) {
        const linesThatFit = this.#countLinesThatFit(prepared, remainingHeight, remainingLines.length);
        if (linesThatFit <= 0) {
          pages.push(this.#finalizePage(currentPage));
          currentPage = this.#createPage(pageBox, false);
          remainingHeight = pageBox.height;
          continue;
        }

        const slice = remainingLines.slice(0, linesThatFit);
        const chunk = {
          ...prepared,
          lines: slice,
          marginTop: firstChunk ? prepared.marginTop : 0,
          marginBottom: remainingLines.length === linesThatFit ? prepared.marginBottom : 6,
          ruleAfter: remainingLines.length === linesThatFit ? prepared.ruleAfter : false,
        };
        currentPage.blocks.push(chunk);
        remainingHeight -= this.#getBlockHeight(chunk);
        remainingLines = remainingLines.slice(linesThatFit);
        firstChunk = false;

        if (remainingLines.length) {
          pages.push(this.#finalizePage(currentPage));
          currentPage = this.#createPage(pageBox, false);
          remainingHeight = pageBox.height;
        }
      }
    }

    if (!pages.includes(currentPage)) {
      const needsSignature = template.signatureBlock?.enabled;
      if (needsSignature && remainingHeight < signatureHeight) {
        pages.push(this.#finalizePage(currentPage));
        currentPage = this.#createPage(pageBox, false);
      }
      currentPage.includeSignature = !!needsSignature;
      pages.push(this.#finalizePage(currentPage));
    }

    return pages;
  }

  #createRenderableBlocks(ctx, maxWidth) {
    const fontSizeBody = ctx.template.typography.bodySize || 10;
    const fontSizeHeading = ctx.template.typography.headingSize || 13;
    const lineHeightBody = ctx.template.typography.lineHeight || 14;
    const lineHeightHeading = lineHeightBody + 2;
    const blocks = [];

    for (const section of ctx.document.sections || []) {
      if (section.visible === false) continue;

      const titleRuns = [{ text: section.title || 'Section', bold: true }];
      blocks.push({
        type: 'heading',
        align: 'left',
        fontSize: fontSizeHeading,
        lineHeight: lineHeightHeading,
        marginTop: 8,
        marginBottom: 6,
        ruleAfter: false,
        splittable: false,
        lines: wrapRichTextRuns(ctx.fonts, titleRuns, fontSizeHeading, maxWidth),
      });

      const parsedBlocks = parseRichTextHtml(section.html || '<p></p>');
      for (const block of parsedBlocks) {
        const fontSize = block.type === 'heading' ? fontSizeHeading : fontSizeBody;
        const lineHeight = block.type === 'heading' ? lineHeightHeading : lineHeightBody;
        blocks.push({
          type: block.type,
          align: block.align || 'left',
          fontSize,
          lineHeight,
          marginTop: block.type === 'heading' ? 6 : 0,
          marginBottom: block.type === 'heading' ? 4 : 8,
          ruleAfter: false,
          splittable: block.type !== 'heading',
          lines: wrapRichTextRuns(ctx.fonts, block.runs || [{ text: '' }], fontSize, maxWidth),
        });
      }
    }

    return blocks;
  }

  #createPage(pageBox, includeIntro) {
    return {
      pageBox,
      header: {},
      footer: {},
      includeIntro,
      includeSignature: false,
      blocks: [],
    };
  }

  #finalizePage(page) {
    return {
      pageBox: page.pageBox,
      header: {},
      footer: {},
      sections: [
        ...(page.includeIntro ? [{ type: 'intro' }] : []),
        { type: 'contractBlocks', data: { blocks: page.blocks } },
        ...(page.includeSignature ? [{ type: 'signature' }] : []),
      ],
    };
  }

  #getBlockHeight(block) {
    return (block.marginTop || 0) + (block.marginBottom || 0) + (block.lines.length * (block.lineHeight || 14)) + (block.ruleAfter ? 6 : 0);
  }

  #countLinesThatFit(block, remainingHeight, totalLines) {
    const lineHeight = block.lineHeight || 14;
    const available = remainingHeight - (block.marginTop || 0) - (block.marginBottom || 0);
    if (available <= lineHeight) return 0;
    return Math.min(totalLines, Math.floor(available / lineHeight));
  }
}
