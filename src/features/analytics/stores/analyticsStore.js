/** @file src/features/analytics/stores/analyticsStore.js */

export default {
  namespaced: true,
  state: () => ({
    enabled: true,
    events: [],
    pageViews: [],
  }),
  mutations: {
    setEnabled(state, value) {
      state.enabled = Boolean(value)
    },
    trackEvent(state, payload) {
      state.events.unshift(payload)
      state.events = state.events.slice(0, 200)
    },
    trackPageView(state, payload) {
      state.pageViews.unshift(payload)
      state.pageViews = state.pageViews.slice(0, 200)
    },
  },
}
