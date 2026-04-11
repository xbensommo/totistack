/**
 * @file index.js
 * @description Central export for document templates
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Document template registry
 * @type {Map<string, string>}
 */
export const documentTemplates = new Map();

/**
 * Load all document templates
 * @returns {Promise<void>}
 */
export async function loadDocumentTemplates() {
  const files = await fs.promises.readdir(__dirname);
  
  for (const file of files) {
    if (file.endsWith('.md') && file !== 'index.js') {
      const content = await fs.promises.readFile(path.join(__dirname, file), 'utf8');
      documentTemplates.set(file, content);
    }
  }
}

/**
 * Get a document template by name
 * @param {string} name - Template filename
 * @returns {string|null} Template content or null if not found
 */
export function getDocumentTemplate(name) {
  return documentTemplates.get(name) || null;
}

/**
 * Get all available document templates
 * @returns {Array<{name: string, content: string}>}
 */
export function getAllDocumentTemplates() {
  return Array.from(documentTemplates.entries()).map(([name, content]) => ({
    name,
    content
  }));
}

/**
 * Generate document with context data
 * @param {string} templateName - Template filename
 * @param {object} context - Data to interpolate
 * @returns {string} Generated document content
 */
export function generateDocument(templateName, context) {
  const template = getDocumentTemplate(templateName);
  if (!template) {
    throw new Error(`Document template not found: ${templateName}`);
  }
  
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

/**
 * Write generated document to file
 * @param {string} templateName - Template filename
 * @param {object} context - Data to interpolate
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
export async function writeDocument(templateName, context, outputPath) {
  const content = generateDocument(templateName, context);
  await fs.promises.writeFile(outputPath, content, 'utf8');
}

// Load templates on import
await loadDocumentTemplates();

export default {
  documentTemplates,
  loadDocumentTemplates,
  getDocumentTemplate,
  getAllDocumentTemplates,
  generateDocument,
  writeDocument
};