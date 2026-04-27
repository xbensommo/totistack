/**
 * @file src/apps/ecommerce/stores/useEcommerceStore.js
 * @description Main Pinia store for ecommerce shell state only.
 *
 * Important:
 * Collection state and shard actions should stay centralized in the root store.
 * This local store is only for page-level UI state.
 */

import { defineStore } from 'pinia'

export const useEcommerceStore = defineStore('ecommerce-app', {
  state: () => ({
    loading: false,
    selectedStoreId: null,
    dashboard: {
      revenue: 0,
      orders: 0,
      averageOrderValue: 0,
      lowStockCount: 0,
      abandonedCarts: 0,
      pendingReturns: 0,
    },
    filters: {
      channel: 'all',
      status: 'all',
      query: '',
    },
  }),
  actions: {
    setLoading(value) {
      this.loading = Boolean(value)
    },
    setSelectedStoreId(value) {
      this.selectedStoreId = value || null
    },
    setDashboard(payload = {}) {
      this.dashboard = {
        ...this.dashboard,
        ...payload,
      }
    },
    setFilters(payload = {}) {
      this.filters = {
        ...this.filters,
        ...payload,
      }
    },
    resetFilters() {
      this.filters = {
        channel: 'all',
        status: 'all',
        query: '',
      }
    },
  },
})
