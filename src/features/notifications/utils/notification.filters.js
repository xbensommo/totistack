/** @file src/features/notifications/utils/notification.filters.js */

/**
 * Filter a notification list by user-facing criteria.
 *
 * @param {Array<Record<string, unknown>>} items
 * @param {Record<string, unknown>} filters
 * @returns {Array<Record<string, unknown>>}
 */
export function filterNotifications(items = [], filters = {}) {
  const {
    search = '',
    type = '',
    channel = '',
    status = '',
    priority = '',
    unreadOnly = false,
  } = filters;

  const needle = String(search).trim().toLowerCase();

  return items.filter((item) => {
    if (type && item.type !== type) return false;
    if (channel && item.channel !== channel) return false;
    if (status && item.status !== status) return false;
    if (priority && item.priority !== priority) return false;
    if (unreadOnly && item.readAt) return false;

    if (!needle) return true;

    const text = [
      item.title,
      item.message,
      item.event,
      item.entityType,
      item.entityId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return text.includes(needle);
  });
}

/**
 * Sort notifications by newest first.
 *
 * @param {Array<Record<string, unknown>>} items
 * @returns {Array<Record<string, unknown>>}
 */
export function sortNotificationsByNewest(items = []) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}
