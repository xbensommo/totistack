/** @file src/apps/doc-module/modules/documents/utils/contractRichText.js */

function stripTags(html = '') {
  return String(html || '')
    .replace(/<\/?(p|div|section|article|h[1-6]|li|ul|ol|br)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export function parseRichTextHtml(html = '') {
  const text = stripTags(html)
  if (!text) return [{ type: 'paragraph', align: 'left', runs: [{ text: '' }] }]

  return text.split(/\n+/).map((line) => ({
    type: 'paragraph',
    align: 'left',
    runs: [{ text: line.trim() }],
  }))
}

export function wrapRichTextRuns(_fonts, runs = [], _fontSize = 10, _maxWidth = 0) {
  const text = runs.map((run) => run?.text || '').join(' ').trim()
  if (!text) return [{ text: '' }]
  return text.split(/\n+/).map((line) => ({ text: line }))
}
