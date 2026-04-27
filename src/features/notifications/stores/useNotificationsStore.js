/** @file src/features/notifications/stores/useNotificationsStore.js */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { filterNotifications, sortNotificationsByNewest } from '../utils/notification.filters.js'

const runtime = {
  rootStore: null,
  getCurrentUser: null,
  allowDemoMode: false,
}

export function configureNotificationsRuntime(config = {}) {
  runtime.rootStore = config.rootStore || config.store || runtime.rootStore
  runtime.getCurrentUser = config.getCurrentUser || runtime.getCurrentUser
  runtime.allowDemoMode = Boolean(config.allowDemoMode ?? runtime.allowDemoMode)
}

function normalizeRow(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : row
  return {
    id: row?.id || data?.id || row?.docId || row?._id || data?.notificationId || data?.code,
    ...data,
  }
}

function normalizeRows(rows = []) {
  return rows.map(normalizeRow).filter((row) => row.id || row.title || row.message)
}

function getCurrentUserId() {
  const user = runtime.getCurrentUser?.() || runtime.rootStore?.currentUser || runtime.rootStore?.user || null
  return user?.uid || user?.id || user?.userId || null
}

function firstExistingAction(...names) {
  const store = runtime.rootStore
  if (!store) return null
  for (const name of names) {
    if (store[name]) return store[name]
  }
  return null
}

async function fetchActionItems(actions, options = {}) {
  if (!actions) return []
  if (actions.fetchInitialPage) {
    await actions.fetchInitialPage(options)
  } else if (actions.fetchList) {
    await actions.fetchList(options)
  } else if (actions.load) {
    await actions.load(options)
  }

  return normalizeRows(
    actions.items ||
    actions.state?.items ||
    actions.rows ||
    actions.data ||
    [],
  )
}

function demoItems() {
  const now = new Date()
  return [
    {
      id: 'ntf_demo_1',
      title: 'Booking confirmed',
      message: 'Booking #BK-1004 has been confirmed.',
      event: 'booking.confirmed',
      type: 'booking',
      channel: 'in_app',
      priority: 'high',
      actionUrl: '/bookings/BK-1004',
      entityId: 'BK-1004',
      status: 'unread',
      createdAt: now.toISOString(),
    },
    {
      id: 'ntf_demo_2',
      title: 'Invoice overdue',
      message: 'Invoice #INV-2201 is overdue and needs follow-up.',
      event: 'invoice.overdue',
      type: 'finance',
      channel: 'email',
      priority: 'critical',
      actionUrl: '/finance/invoices/INV-2201',
      entityId: 'INV-2201',
      status: 'unread',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
    },
  ]
}

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([])
  const templates = ref([])
  const logs = ref([])
  const preferences = ref({
    enabled: true,
    channels: ['in_app', 'email', 'whatsapp'],
    quietHours: { enabled: false, start: '22:00', end: '06:00' },
    categorySettings: {},
  })
  const filters = ref({
    search: '',
    type: '',
    channel: '',
    status: '',
    priority: '',
    unreadOnly: false,
  })
  const drawerOpen = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const hydrated = ref(false)

  const visibleItems = computed(() => sortNotificationsByNewest(filterNotifications(items.value, filters.value)))
  const unreadCount = computed(() => items.value.filter((item) => !item.readAt && item.status !== 'archived' && item.status !== 'read').length)
  const recentItems = computed(() => visibleItems.value.slice(0, 10))

  function hydrate(payload = {}) {
    if (Array.isArray(payload.items)) items.value = normalizeRows(payload.items)
    if (Array.isArray(payload.templates)) templates.value = normalizeRows(payload.templates)
    if (Array.isArray(payload.logs)) logs.value = normalizeRows(payload.logs)
    if (payload.preferences) preferences.value = { ...preferences.value, ...payload.preferences }
    hydrated.value = true
  }

  async function loadInbox(options = {}) {
    const actions = firstExistingAction('notificationsActions')
    if (!actions) {
      if (runtime.allowDemoMode && !items.value.length) hydrate({ items: demoItems() })
      return items.value
    }

    loading.value = true
    error.value = null
    try {
      const userId = options.userId || getCurrentUserId()
      const filters = [
        ...(userId ? [{ field: 'recipientUserId', op: '==', value: userId }] : []),
        { field: 'isDeleted', op: '==', value: false },
      ]
      items.value = await fetchActionItems(actions, {
        limit: options.limit || 50,
        filters,
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
      hydrated.value = true
      return items.value
    } catch (caughtError) {
      error.value = caughtError
      throw caughtError
    } finally {
      loading.value = false
    }
  }

  async function loadTemplates(options = {}) {
    const actions = firstExistingAction('notificationTemplatesActions', 'notification_templatesActions')
    templates.value = await fetchActionItems(actions, {
      limit: options.limit || 100,
      filters: [{ field: 'isDeleted', op: '==', value: false }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
    })
    return templates.value
  }

  async function loadLogs(options = {}) {
    const actions = firstExistingAction('notificationDeliveriesActions', 'notification_logsActions', 'notificationLogsActions')
    logs.value = await fetchActionItems(actions, {
      limit: options.limit || 100,
      filters: [{ field: 'isDeleted', op: '==', value: false }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
    })
    return logs.value
  }

  function setFilters(payload = {}) {
    filters.value = { ...filters.value, ...payload }
  }

  function setDrawerOpen(value) {
    drawerOpen.value = Boolean(value)
  }

  function prependNotification(notification) {
    const next = normalizeRow(notification)
    items.value = [next, ...items.value.filter((item) => item.id !== next.id)]
  }

  async function markRead(notificationId) {
    const id = typeof notificationId === 'object' ? notificationId.id : notificationId
    items.value = items.value.map((item) =>
      item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString(), status: 'read' } : item,
    )
    const actions = firstExistingAction('notificationsActions')
    await actions?.update?.(id, { status: 'read', readAt: new Date(), updatedAt: new Date() })
  }

  async function markAllRead() {
    const unread = items.value.filter((item) => !item.readAt && item.status !== 'read')
    await Promise.all(unread.map((item) => markRead(item.id)))
  }

  async function archive(notificationId) {
    const id = typeof notificationId === 'object' ? notificationId.id : notificationId
    items.value = items.value.map((item) =>
      item.id === id ? { ...item, archivedAt: new Date().toISOString(), status: 'archived' } : item,
    )
    const actions = firstExistingAction('notificationsActions')
    await actions?.update?.(id, { status: 'archived', archivedAt: new Date(), updatedAt: new Date() })
  }

  async function setPreferences(payload = {}) {
    preferences.value = { ...preferences.value, ...payload }
    const actions = firstExistingAction('notificationPreferencesActions', 'notification_preferencesActions')
    const userId = getCurrentUserId()
    if (!actions || !userId) return preferences.value
    if (actions.setById) await actions.setById(userId, { userId, ...preferences.value, updatedAt: new Date() })
    else if (actions.update) await actions.update(userId, { ...preferences.value, updatedAt: new Date() })
    return preferences.value
  }

  return {
    items,
    templates,
    logs,
    preferences,
    filters,
    drawerOpen,
    loading,
    error,
    hydrated,
    visibleItems,
    unreadCount,
    recentItems,
    hydrate,
    loadInbox,
    loadTemplates,
    loadLogs,
    setFilters,
    setDrawerOpen,
    prependNotification,
    markRead,
    markAllRead,
    archive,
    setPreferences,
  }
})

export default useNotificationsStore
