import { PAGE_DIMENSIONS } from './constants.js';

function htmlToText(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h\d>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function estimateTextLines(text, charsPerLine = 88) {
  const paragraphs = String(text || '').split('\n');
  let lines = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines += 1;
      continue;
    }

    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= charsPerLine) {
        current = candidate;
      } else {
        lines += 1;
        current = word;
      }
    }
    if (current) lines += 1;
  }

  return Math.max(lines, 1);
}

function estimateHtmlHeight(html, base = 48) {
  const text = htmlToText(html);
  return base + (estimateTextLines(text) * 18);
}

function estimateListHeight(items = []) {
  if (!items.length) return 72;
  return 56 + items.reduce((sum, item) => sum + Math.max(34, estimateTextLines(`${item.label} ${item.value}`, 84) * 18), 0);
}

function estimateTableRowHeight(item) {
  const descriptionLines = estimateTextLines(item?.description || '', 46);
  return Math.max(40, 18 + (descriptionLines * 18));
}

function estimateSectionHeight(section) {
  switch (section.kind) {
    case 'meta':
      return 138;
    case 'parties':
      return 188;
    case 'rich-text':
      return estimateHtmlHeight(section.html, 64);
    case 'summary':
      return estimateHtmlHeight(section.html, 72);
    case 'notes':
      return estimateHtmlHeight(section.html, 60);
    case 'list':
      return estimateListHeight(section.items);
    case 'signatures':
      return 212;
    case 'totals':
      return 162;
    case 'table':
      return 64 + (section.items || []).reduce((sum, item) => sum + estimateTableRowHeight(item), 0);
    default:
      return 84;
  }
}

function splitTableSection(section, remainingHeight, availableHeight) {
  const chunks = [];
  const rows = Array.isArray(section.items) ? section.items : [];
  let index = 0;
  let firstChunk = true;

  while (index < rows.length) {
    const chunk = {
      ...section,
      items: [],
      isContinuation: !firstChunk,
      title: firstChunk ? section.title : `${section.title} (continued)`,
    };
    let used = 64;
    const maxHeight = firstChunk ? remainingHeight : availableHeight;

    while (index < rows.length) {
      const rowHeight = estimateTableRowHeight(rows[index]);
      if (used + rowHeight <= maxHeight || !chunk.items.length) {
        chunk.items.push(rows[index]);
        used += rowHeight;
        index += 1;
      } else {
        break;
      }
    }

    chunks.push(chunk);
    firstChunk = false;
  }

  return chunks;
}

function splitListSection(section, remainingHeight, availableHeight) {
  const items = Array.isArray(section.items) ? section.items : [];
  const chunks = [];
  let index = 0;
  let firstChunk = true;

  while (index < items.length) {
    const chunk = {
      ...section,
      items: [],
      isContinuation: !firstChunk,
      title: firstChunk ? section.title : `${section.title} (continued)`,
    };
    const maxHeight = firstChunk ? remainingHeight : availableHeight;
    let used = 56;

    while (index < items.length) {
      const itemHeight = Math.max(34, estimateTextLines(`${items[index].label} ${items[index].value}`, 84) * 18);
      if (used + itemHeight <= maxHeight || !chunk.items.length) {
        chunk.items.push(items[index]);
        used += itemHeight;
        index += 1;
      } else {
        break;
      }
    }

    chunks.push(chunk);
    firstChunk = false;
  }

  return chunks;
}

function getHtmlBlockNodes(html) {
  const source = String(html || '').trim();
  if (!source) return [];

  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(`<div>${source}</div>`, 'text/html');
    const wrapper = doc.body.firstElementChild;
    const nodes = wrapper ? Array.from(wrapper.children).map((node) => node.outerHTML).filter(Boolean) : [];
    return nodes.length ? nodes : [source];
  }

  return source
    .split(/(?=<h\d\b|<p\b|<ul\b|<ol\b|<blockquote\b)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitHtmlSection(section, remainingHeight, availableHeight) {
  const blocks = getHtmlBlockNodes(section.html);
  if (!blocks.length) return [section];

  const chunks = [];
  let currentHtml = '';
  let used = 0;
  let maxHeight = remainingHeight;
  let firstChunk = true;

  function pushChunk(force = false) {
    if (!currentHtml && !force) return;
    chunks.push({
      ...section,
      html: currentHtml || '<p></p>',
      isContinuation: !firstChunk,
      title: firstChunk ? section.title : `${section.title} (continued)`,
    });
    currentHtml = '';
    used = 0;
    maxHeight = availableHeight;
    firstChunk = false;
  }

  for (const block of blocks) {
    const candidate = `${currentHtml}${block}`;
    const candidateHeight = estimateHtmlHeight(candidate, section.kind === 'summary' ? 72 : 60);

    if ((candidateHeight <= maxHeight) || !currentHtml) {
      currentHtml = candidate;
      used = candidateHeight;
      continue;
    }

    pushChunk();
    currentHtml = block;
    used = estimateHtmlHeight(currentHtml, section.kind === 'summary' ? 72 : 60);

    if (used > maxHeight && !chunks.length) {
      pushChunk(true);
    }
  }

  pushChunk();
  return chunks.length ? chunks : [section];
}

function splitSection(section, remainingHeight, availableHeight) {
  if (section.kind === 'table') {
    return splitTableSection(section, remainingHeight, availableHeight);
  }

  if (section.kind === 'list') {
    return splitListSection(section, remainingHeight, availableHeight);
  }

  if (section.kind === 'summary' || section.kind === 'rich-text' || section.kind === 'notes') {
    return splitHtmlSection(section, remainingHeight, availableHeight);
  }

  return [section];
}

export function buildPagePlan(document, sections) {
  const pageSize = PAGE_DIMENSIONS[document?.layout?.pageSize || 'A4'] || PAGE_DIMENSIONS.A4;
  const margins = document?.layout?.margins || {};
  const headerHeight = document?.layout?.header?.enabled ? (document?.layout?.header?.height || 0) : 0;
  const footerHeight = document?.layout?.footer?.enabled ? (document?.layout?.footer?.height || 0) : 0;
  const availableHeight = pageSize.height - (margins.top || 0) - (margins.bottom || 0) - headerHeight - footerHeight;

  const pages = [];
  let currentPage = {
    pageNumber: 1,
    sections: [],
  };
  let usedHeight = 0;

  function pushCurrentPage() {
    pages.push(currentPage);
    currentPage = {
      pageNumber: pages.length + 1,
      sections: [],
    };
    usedHeight = 0;
  }

  for (const originalSection of sections) {
    const chunks = splitSection(originalSection, availableHeight - usedHeight, availableHeight);

    chunks.forEach((section, index) => {
      const estimatedHeight = estimateSectionHeight(section);
      const canFit = usedHeight + estimatedHeight <= availableHeight;
      const startsNewPage = index > 0 || (!canFit && currentPage.sections.length);

      if (startsNewPage) {
        pushCurrentPage();
      }

      currentPage.sections.push(section);
      usedHeight += estimatedHeight;
    });
  }

  if (currentPage.sections.length || !pages.length) {
    pages.push(currentPage);
  }

  return {
    pageSize,
    availableHeight,
    headerHeight,
    footerHeight,
    margins,
    pages: pages.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
      pageCount: pages.length,
    })),
  };
}
