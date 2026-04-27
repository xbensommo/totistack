/** @file src/modules/documents/domain/DocumentStateMachine.js */
const TRANSITIONS = { draft: ['sent', 'void'], sent: ['approved', 'signed', 'overdue', 'void'], approved: ['signed', 'void'], signed: ['paid', 'void'], overdue: ['paid', 'void'], paid: ['void'], void: [] };
export class DocumentStateMachine {
  canTransition(from, to) { return Boolean(TRANSITIONS[from]?.includes(to)); }
  assertTransition({ from, to, document }) {
    if (!this.canTransition(from, to)) throw new Error(`Illegal document status transition: ${from} -> ${to}`);
    if (to === 'paid' && !document?.number) throw new Error('Document cannot be marked paid without an issued document number.');
    if (to === 'signed' && !document?.signature?.name) throw new Error('Document cannot be marked signed without signer identity.');
  }
}
