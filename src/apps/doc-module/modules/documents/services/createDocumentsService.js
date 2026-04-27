/** @file src/modules/documents/services/createDocumentsService.js */
import { buildDocumentNumber } from '../domain/buildDocumentNumber.js';
import { normalizeDocumentPayload } from '../domain/normalizeDocumentPayload.js';

/**
 * Create the document service facade.
 *
 * @param {{
 *  renderer: { render: (input: Record<string, any>) => Promise<Uint8Array|ArrayBuffer|Buffer> },
 *  stores: { documents: Record<string, any>, auditLogs: Record<string, any> },
 *  fileStorage: { uploadBytes: (input: Record<string, any>) => Promise<Record<string, any>> },
 *  stateMachine: { assertTransition: (input: Record<string, any>) => void },
 *  numberBuilder?: typeof buildDocumentNumber,
 * }} dependencies
 * @returns {{
 *  generatePdf: (input: Record<string, any>) => Promise<any>,
 *  createDraft: (document: Record<string, any>) => Promise<any>,
 *  finalizeDocument: (input: Record<string, any>) => Promise<any>,
 *  updateStatus: (input: Record<string, any>) => Promise<void>,
 * }}
 */
export function createDocumentsService({ renderer, stores, fileStorage, stateMachine, numberBuilder = buildDocumentNumber }) {
  return {
    async generatePdf({ template, document }) {
      return renderer.render({
        template,
        document: normalizeDocumentPayload(document),
      });
    },

    async createDraft(document) {
      const payload = normalizeDocumentPayload({ ...document, status: 'draft' });
      const result = await stores.documents.add(payload);

      await stores.auditLogs.add({
        documentId: result.id,
        event: 'document_created',
        actorId: payload.metadata?.actorId || 'system',
        actorName: payload.metadata?.actorName || 'System',
        before: null,
        after: { status: 'draft' },
        meta: { type: payload.type },
      });

      return result;
    },

    async finalizeDocument({ template, document, nextNumber, definition, prefix, prefixMap }) {
      const normalized = normalizeDocumentPayload(document);
      const issuedNumber = normalized.number || numberBuilder({
        type: normalized.type,
        year: new Date().getFullYear(),
        nextNumber,
        definition,
        prefix,
        prefixMap,
      });
      const beforeStatus = normalized.status || 'draft';

      stateMachine.assertTransition({
        from: beforeStatus,
        to: 'sent',
        document: { ...normalized, number: issuedNumber },
      });

      const generatedAt = new Date().toISOString();
      const finalized = {
        ...normalized,
        number: issuedNumber,
        status: 'sent',
        pdf: {
          ...(normalized.pdf || {}),
          generatedAt,
        },
      };

      const pdfBytes = await renderer.render({ template, document: finalized });
      const upload = await fileStorage.uploadBytes({
        path: `documents/${finalized.id || 'unknown'}/${issuedNumber}.pdf`,
        bytes: pdfBytes,
        contentType: 'application/pdf',
      });

      const patch = {
        number: issuedNumber,
        status: 'sent',
        pdf: {
          storagePath: upload.path,
          downloadURL: upload.downloadURL,
          generatedAt,
        },
      };

      if (finalized.id) {
        await stores.documents.update(finalized.id, patch, finalized.shardSource);
        await stores.auditLogs.add({
          documentId: finalized.id,
          event: 'document_finalized',
          actorId: finalized.metadata?.actorId || 'system',
          actorName: finalized.metadata?.actorName || 'System',
          before: { status: beforeStatus },
          after: { status: 'sent', number: issuedNumber },
          meta: { pdfPath: upload.path },
        });
      }

      return { upload, document: finalized, bytes: pdfBytes };
    },

    async updateStatus({ document, toStatus }) {
      stateMachine.assertTransition({ from: document.status, to: toStatus, document });
      await stores.documents.update(document.id, { status: toStatus }, document.shardSource);
      await stores.auditLogs.add({
        documentId: document.id,
        event: 'document_status_changed',
        actorId: document.metadata?.actorId || 'system',
        actorName: document.metadata?.actorName || 'System',
        before: { status: document.status },
        after: { status: toStatus },
        meta: {},
      });
    },
  };
}
