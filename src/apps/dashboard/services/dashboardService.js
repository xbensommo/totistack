/**
 * @file apps/dashboard/services/dashboardService.js
 * @description Generic dashboard service for the latest Totistack root-store architecture.
 *
 * Design rules:
 * - The root store owns auth and RBAC.
 * - This module does not create a provider or mutate the router.
 * - Metrics are derived from available collections and root-store state where possible.
 * - The service stays generic so it can be reused as a starter dashboard across projects.
 */

import { computed } from 'vue';
import { useAppStore } from '@app/stores/appStore/index.js';

/**
 * Common collection hints used to derive dashboard metrics when those collections exist.
 */
export const DASHBOARD_COLLECTION_HINTS = Object.freeze({
  users: ['users'],
  orders: ['orders', 'sales_orders'],
  bookings: ['bookings', 'appointments'],
  opportunities: ['crm_opportunities'],
  notifications: ['notifications'],
  activity: ['crm_activities', 'audit_logs', 'activity_logs'],
});

/**
 * Default widget identifiers shipped by the starter dashboard app.
 */
export const DASHBOARD_WIDGETS = Object.freeze([
  'metrics',
  'recent-activity',
  'charts',
  'notifications',
  'quick-actions',
  'system-status',
]);

/**
 * Normalize a date-like value into a Date.
 *
 * @param {unknown} value
 * @returns {Date|null}
 */
function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Pick the first collection name that exists on the root store state.
 *
 * @param {ReturnType<typeof useAppStore>} store
 * @param {string[]} candidates
 * @returns {string|null}
 */
function pickCollectionName(store, candidates = []) {
  return candidates.find((collectionName) => Boolean(store?.[collectionName])) || null;
}

/**
 * Read collection items safely from the root store.
 *
 * @param {ReturnType<typeof useAppStore>} store
 * @param {string|null} collectionName
 * @returns {Record<string, any>[]}
 */
function getCollectionItems(store, collectionName) {
  const bucket = store?.[collectionName]
  const items = bucket?.items || bucket?.value?.items || bucket?.value || bucket
  return Array.isArray(items) ? items : []
}

/**
 * Try to load an initial page for a generated collection when its state is empty.
 *
 * @param {ReturnType<typeof useAppStore>} store
 * @param {string|null} collectionName
 * @returns {Promise<void>}
 */
async function ensureCollectionLoaded(store, collectionName) {
  if (!collectionName) return;

  const items = getCollectionItems(store, collectionName);
  if (items.length > 0) return;

  const actionKey = `${collectionName}Actions`;
  const actions = store?.[actionKey];
  if (actions?.fetchInitialPage) {
    await actions.fetchInitialPage();
  }
}

/**
 * Sum numeric field values from a collection.
 *
 * @param {Record<string, any>[]} items
 * @param {string[]} fieldNames
 * @returns {number}
 */
function sumFieldValues(items = [], fieldNames = []) {
  return items.reduce((total, item) => {
    const fieldName = fieldNames.find((name) => Number.isFinite(Number(item?.[name])));
    return total + (fieldName ? Number(item[fieldName]) : 0);
  }, 0);
}

/**
 * Format a compact status label.
 *
 * @param {string} value
 * @returns {string}
 */
function toTitleCase(value = '') {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Group items by day over the supplied period.
 *
 * @param {Record<string, any>[]} items
 * @param {number} periodDays
 * @returns {{ labels: string[], values: number[] }}
 */
function buildDailySeries(items = [], periodDays = 30) {
  const labels = [];
  const values = [];
  const now = new Date();
  const buckets = new Map();

  for (let index = periodDays - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    labels.push(key);
    buckets.set(key, 0);
  }

  items.forEach((item) => {
    const rawDate = item?.createdAt || item?.timestamp || item?.lastActivityAt || item?.updatedAt;
    const date = normalizeDate(rawDate);
    if (!date) return;

    const key = new Date(date).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
  });

  labels.forEach((label) => values.push(buckets.get(label) || 0));
  return { labels, values };
}

/**
 * Build stable dashboard quick actions.
 *
 * @returns {Array<Record<string, string>>}
 */
function buildQuickActions() {
  return [
    { id: 'dashboard-home', label: 'Open Dashboard', to: '/dashboard', description: 'Return to the main dashboard overview.' },
    { id: 'dashboard-analytics', label: 'View Analytics', to: '/dashboard/analytics', description: 'Open metrics and trend summaries.' },
    { id: 'dashboard-reports', label: 'Open Reports', to: '/dashboard/reports', description: 'Review export-ready operational reports.' },
    { id: 'crm-leads', label: 'CRM Leads', to: '/crm/leads', description: 'Jump directly into lead management.' },
  ];
}

/**
 * Create the dashboard service bound to the root store.
 *
 * @param {ReturnType<typeof useAppStore>} [store]
 * @returns {object}
 */
export function createDashboardService(store = useAppStore()) {
  const userCollection = pickCollectionName(store, DASHBOARD_COLLECTION_HINTS.users);
  const orderCollection = pickCollectionName(store, DASHBOARD_COLLECTION_HINTS.orders);
  const bookingCollection = pickCollectionName(store, DASHBOARD_COLLECTION_HINTS.bookings);
  const opportunityCollection = pickCollectionName(store, DASHBOARD_COLLECTION_HINTS.opportunities);
  const notificationCollection = pickCollectionName(store, DASHBOARD_COLLECTION_HINTS.notifications);
  const activityCollection = pickCollectionName(store, DASHBOARD_COLLECTION_HINTS.activity);

  /**
   * Check read access when RBAC is enabled.
   *
   * @param {string} permission
   * @returns {void}
   */
  function assertPermission(permission) {
    if (store.rbacEnabled?.value && typeof store.hasPermission === 'function' && !store.hasPermission(permission)) {
      const error = new Error(`Missing permission: ${permission}`);
      error.code = 'dashboard/forbidden';
      throw error;
    }
  }

  /**
   * Prime dashboard-related collection state.
   *
   * @returns {Promise<void>}
   */
  async function warmup() {
    await Promise.all([
      ensureCollectionLoaded(store, userCollection),
      ensureCollectionLoaded(store, orderCollection),
      ensureCollectionLoaded(store, bookingCollection),
      ensureCollectionLoaded(store, opportunityCollection),
      ensureCollectionLoaded(store, notificationCollection),
      ensureCollectionLoaded(store, activityCollection),
    ]);
  }

  /**
   * Derive overview metrics from the currently available collection state.
   *
   * @returns {Promise<Record<string, any>>}
   */
  async function getOverviewMetrics() {
    assertPermission('dashboard:read');
    await warmup();

    const users = getCollectionItems(store, userCollection);
    const orders = getCollectionItems(store, orderCollection);
    const bookings = getCollectionItems(store, bookingCollection);
    const opportunities = getCollectionItems(store, opportunityCollection);

    const revenue = sumFieldValues(orders, ['total', 'totalAmount', 'amount'])
      || sumFieldValues(opportunities.filter((item) => item?.stage === 'closed_won'), ['amount', 'weightedAmount']);

    const metrics = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalBookings: bookings.length,
      revenue,
      conversionRate: orders.length > 0 && users.length > 0
        ? Math.round((orders.length / users.length) * 100)
        : 0,
      activeSessions: store.currentUser?.value ? 1 : 0,
      updatedAt: new Date(),
    };

    return {
      raw: metrics,
      cards: [
        { id: 'users', label: 'Users', value: metrics.totalUsers.toLocaleString(), description: 'Tracked users available in store state.' },
        { id: 'orders', label: 'Orders', value: metrics.totalOrders.toLocaleString(), description: 'Orders loaded into the generated collection registry.' },
        { id: 'bookings', label: 'Bookings', value: metrics.totalBookings.toLocaleString(), description: 'Bookings or appointments currently available.' },
        { id: 'revenue', label: 'Revenue', value: new Intl.NumberFormat('en-NA', { style: 'currency', currency: 'NAD', maximumFractionDigits: 0 }).format(metrics.revenue), description: 'Derived from orders or closed opportunities.' },
      ],
    };
  }

  /**
   * Build recent activity items.
   *
   * @param {{ limit?: number }} [options]
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async function getRecentActivity(options = {}) {
    assertPermission('dashboard:read');
    await ensureCollectionLoaded(store, activityCollection);

    const items = getCollectionItems(store, activityCollection);
    const limit = Number(options.limit || 8);

    if (items.length > 0) {
      return [...items]
        .sort((a, b) => {
          const aDate = normalizeDate(a?.createdAt || a?.timestamp || a?.updatedAt)?.getTime() || 0;
          const bDate = normalizeDate(b?.createdAt || b?.timestamp || b?.updatedAt)?.getTime() || 0;
          return bDate - aDate;
        })
        .slice(0, limit)
        .map((item) => ({
          id: item.id || item.uid || globalThis.crypto?.randomUUID?.() || `${Math.random()}`,
          title: item.subject || item.title || item.type || 'Activity',
          description: item.description || item.notes || 'Recent activity was recorded.',
          type: item.type || item.category || 'activity',
          timestamp: normalizeDate(item.createdAt || item.timestamp || item.updatedAt),
        }));
    }

    return Array.isArray(store.recentActivity?.value) ? store.recentActivity.value.slice(0, limit) : [];
  }

  /**
   * Build trend chart data from available store collections.
   *
   * @param {{ periodDays?: number }} [options]
   * @returns {Promise<Record<string, any>>}
   */
  async function getChartData(options = {}) {
    assertPermission('analytics:read');
    await warmup();

    const periodDays = Number(options.periodDays || 30);
    const users = getCollectionItems(store, userCollection);
    const orders = getCollectionItems(store, orderCollection);
    const bookings = getCollectionItems(store, bookingCollection);

    return {
      users: buildDailySeries(users, periodDays),
      orders: buildDailySeries(orders, periodDays),
      bookings: buildDailySeries(bookings, periodDays),
    };
  }

  /**
   * Return dashboard notifications.
   *
   * @param {{ limit?: number }} [options]
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async function getNotifications(options = {}) {
    assertPermission('dashboard:read');
    await ensureCollectionLoaded(store, notificationCollection);

    const items = getCollectionItems(store, notificationCollection);
    const limit = Number(options.limit || 6);

    if (items.length > 0) {
      return items.slice(0, limit).map((item) => ({
        id: item.id || item.uid || `${Math.random()}`,
        title: item.title || item.subject || 'Notification',
        description: item.description || item.message || 'A new notification is available.',
        level: item.level || item.type || 'info',
      }));
    }

    return [
      { id: 'starter-1', title: 'System ready', description: 'Dashboard starter widgets are active and waiting for project data.', level: 'success' },
      { id: 'starter-2', title: 'Generated routes online', description: 'This dashboard now runs on the latest generated assembly flow.', level: 'info' },
    ].slice(0, limit);
  }

  /**
   * Return status cards for the dashboard.
   *
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async function getSystemStatus() {
    assertPermission('dashboard:read');

    return [
      { id: 'auth', label: 'Authentication', status: store.authInitialized?.value ? 'healthy' : 'starting', detail: store.currentUser?.value ? 'Authenticated session ready.' : 'Waiting for user session.' },
      { id: 'rbac', label: 'Access Control', status: store.rbacEnabled?.value === false ? 'disabled' : 'healthy', detail: store.rbacEnabled?.value === false ? 'Role and permission checks are disabled by config.' : 'Role and permission checks are enabled.' },
      { id: 'network', label: 'Browser Network', status: typeof navigator !== 'undefined' && navigator.onLine === false ? 'warning' : 'healthy', detail: typeof navigator !== 'undefined' && navigator.onLine === false ? 'Browser reports offline mode.' : 'Browser reports online mode.' },
      { id: 'data', label: 'Generated Collections', status: 'healthy', detail: 'Dashboard reads from the generated collection registry through the root store.' },
    ];
  }

  /**
   * Build default quick actions.
   *
   * @returns {Promise<Array<Record<string, string>>>}
   */
  async function getQuickActions() {
    assertPermission('dashboard:read');
    return buildQuickActions();
  }

  /**
   * Build a full dashboard snapshot for page rendering.
   *
   * @returns {Promise<Record<string, any>>}
   */
  async function getDashboardSnapshot() {
    const [metrics, recentActivity, charts, notifications, systemStatus, quickActions] = await Promise.all([
      getOverviewMetrics(),
      getRecentActivity(),
      getChartData(),
      getNotifications(),
      getSystemStatus(),
      getQuickActions(),
    ]);

    return {
      metrics,
      recentActivity,
      charts,
      notifications,
      systemStatus,
      quickActions,
      widgets: [...DASHBOARD_WIDGETS],
      generatedAt: new Date(),
    };
  }

  return {
    warmup,
    getOverviewMetrics,
    getRecentActivity,
    getChartData,
    getNotifications,
    getSystemStatus,
    getQuickActions,
    getDashboardSnapshot,
    currentUser: computed(() => store.currentUser?.value || null),
    isLoading: computed(() => Boolean(store.isLoading?.value)),
  };
}

/**
 * Convenience composable for setup scripts.
 *
 * @returns {ReturnType<typeof createDashboardService>}
 */
export function useDashboardService() {
  return createDashboardService();
}

export default {
  createDashboardService,
  useDashboardService,
};
