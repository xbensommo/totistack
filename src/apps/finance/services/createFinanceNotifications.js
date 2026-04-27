/** @file src/apps/finance/services/createFinanceNotifications.js */

async function emit(notifications, event, payload) {
  if (typeof notifications?.handleEvent === 'function') {
    await notifications.handleEvent(event, payload)
  }
}

export function createFinanceNotifications(notifications = null) {
  return {
    async transactionReviewed(transaction, actor = null) {
      await emit(notifications, 'finance.transaction.reviewed', {
        notifyAdmins: true,
        actorId: actor?.id || actor?.uid || null,
        actorName: actor?.displayName || actor?.email || 'System',
        entityId: transaction?.id || null,
        entityType: 'finance_transaction',
        entityLabel: transaction?.referenceNumber || transaction?.description || 'Transaction',
        meta: { transactionId: transaction?.id || null },
      })
    },
    async transactionPosted(transaction, actor = null) {
      await emit(notifications, 'finance.transaction.posted', {
        notifyAdmins: true,
        actorId: actor?.id || actor?.uid || null,
        actorName: actor?.displayName || actor?.email || 'System',
        entityId: transaction?.id || null,
        entityType: 'finance_transaction',
        entityLabel: transaction?.referenceNumber || transaction?.description || 'Transaction',
        meta: { transactionId: transaction?.id || null },
      })
    },
    async journalReversed(entry, actor = null) {
      await emit(notifications, 'finance.journal.reversed', {
        notifyAdmins: true,
        actorId: actor?.id || actor?.uid || null,
        actorName: actor?.displayName || actor?.email || 'System',
        entityId: entry?.id || null,
        entityType: 'finance_journal_entry',
        entityLabel: entry?.reference || entry?.id || 'Journal entry',
        meta: { journalEntryId: entry?.id || null },
      })
    },
    async periodClosed(period, actor = null) {
      await emit(notifications, 'finance.period.closed', {
        notifyAdmins: true,
        actorId: actor?.id || actor?.uid || null,
        actorName: actor?.displayName || actor?.email || 'System',
        entityId: period?.id || null,
        entityType: 'finance_period',
        entityLabel: period?.key || 'Accounting period',
        periodKey: period?.key || '',
        meta: { periodId: period?.id || null, periodKey: period?.key || null },
      })
    },
  }
}

export default createFinanceNotifications
