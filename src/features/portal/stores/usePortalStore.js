/** @file src/features/portal/stores/usePortalStore.js */

import { defineStore } from 'pinia'
import { createPortalService } from '../services/portalService.js'

export const usePortalStore = defineStore('portalFeature', {
  state: () => ({
    loading: false,
    error: null,
    profileKey: 'generic',
    dashboard: null,
    workspace: null,
    memberships: [],
    adminMemberships: [],
    preferences: null,
    tickets: [],
    lastActionResult: null,
  }),
  actions: {
    service() {
      return createPortalService()
    },
    async bootstrap(profileKey = this.profileKey) {
      this.loading = true
      this.error = null
      this.profileKey = profileKey
      try {
        const service = this.service()
        service.setBusinessProfile(profileKey)
        const [dashboard, workspace, memberships, preferences, tickets] = await Promise.all([
          service.getDashboardSummary(profileKey),
          service.getWorkspace(profileKey),
          service.getMyMemberships(),
          service.getPortalPreferences(),
          service.getPortalTickets(),
        ])
        this.dashboard = dashboard
        this.workspace = workspace
        this.memberships = memberships
        this.preferences = preferences
        this.tickets = tickets
        return { dashboard, workspace }
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async refreshWorkspace() {
      return this.bootstrap(this.profileKey)
    },
    async runAction(actionKey, payload = {}) {
      this.loading = true
      this.error = null
      try {
        const result = await this.service().runBusinessAction(actionKey, {
          ...payload,
          profileKey: payload.profileKey || this.profileKey,
        })
        this.lastActionResult = result
        await this.refreshWorkspace()
        return result
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async createSupportTicket(payload = {}) {
      this.loading = true
      this.error = null
      try {
        const result = await this.service().submitSupportTicket({
          ...payload,
          businessProfileKey: payload.businessProfileKey || this.profileKey,
        })
        await this.refreshWorkspace()
        return result
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async savePreferences(payload = {}) {
      this.loading = true
      this.error = null
      try {
        const result = await this.service().savePreferences(payload)
        await this.refreshWorkspace()
        return result
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async loadAdminMemberships() {
      this.loading = true
      this.error = null
      try {
        const memberships = await this.service().listAllMemberships()
        this.adminMemberships = memberships
        return memberships
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})

export default usePortalStore
