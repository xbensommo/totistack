/**
 * @file document-registry.js
 * @description Registry for document templates.
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { getPackageRoot } from '../utils/path.js';
import { logger } from '../utils/index.js';

export class DocumentRegistry {
  constructor() {
    /** @type {Map<string, string>} */
    this.documents = new Map();
  }

  async load() {
    const docsDir = path.join(getPackageRoot(), '', 'documents');
    if (!await fs.pathExists(docsDir)) {
      logger.warn('Documents directory not found:', docsDir);
      return;
    }
    const files = await fs.readdir(docsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(docsDir, file), 'utf8');
        this.documents.set(file, content);
        logger.debug(`Loaded document: ${file}`);
      }
    }
  }

  get(name) {
    return this.documents.get(name);
  }

  getAll() {
    return Array.from(this.documents.entries());
  }
}