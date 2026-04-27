/** @file src/features/portal/composables/usePortal.js */

import { storeToRefs } from 'pinia'
import { usePortalStore } from '../stores/usePortalStore.js'

export function usePortal() {
  const store = usePortalStore()
  const refs = storeToRefs(store)

  return {
    store,
    ...refs,
    bootstrap: store.bootstrap,
    refreshWorkspace: store.refreshWorkspace,
    runAction: store.runAction,
    createSupportTicket: store.createSupportTicket,
    savePreferences: store.savePreferences,
    loadAdminMemberships: store.loadAdminMemberships,
  }
}

export default usePortal
