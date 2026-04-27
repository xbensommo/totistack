/**
 * @file src/core/actions/create-modal-confirm-adapter.js
 * @description Modal-backed confirm adapter for shared global confirm dialogs.
 */

/**
 * Create a modal confirm adapter from an injected modal store/service.
 *
 * The modal service must expose one method:
 * - open(request): Promise<boolean>
 *
 * @param {{ open: (request: Record<string, any>) => Promise<boolean> }} modalService
 * @returns {(request: Record<string, any>) => Promise<boolean>}
 */
export function createModalConfirmAdapter(modalService) {
  if (!modalService || typeof modalService.open !== 'function') {
    throw new TypeError('createModalConfirmAdapter requires a modalService with open(request).');
  }

  return async function modalConfirmAdapter(request) {
    return modalService.open(request);
  };
}
