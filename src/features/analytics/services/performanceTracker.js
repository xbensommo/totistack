/** @file src/features/analytics/services/performanceTracker.js */

function buildApi() {
  return {
    async initialize(config = {}, analyticsService = null) {
      this.config = config
      this.analyticsService = analyticsService
      return this
    },
    track(metric = {}) {
      if (typeof this.analyticsService?.trackEvent === 'function') {
        return this.analyticsService.trackEvent({
          category: 'performance',
          action: metric.action || metric.name || 'metric',
          label: metric.label || metric.path || null,
          value: metric.value ?? null,
          ...metric,
        })
      }
      return metric
    },
  }
}

const performanceTracker = buildApi()
export function createPerformanceTracker() {
  return buildApi()
}
export default performanceTracker
