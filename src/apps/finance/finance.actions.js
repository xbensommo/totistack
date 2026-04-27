/** @file src/apps/finance/finance.actions.js */

function getFinanceCommandBus(context) {
  const bus = context?.commandBus || context?.services?.financeCommandBus || context?.services?.finance
  if (!bus) throw new Error('Finance command bus is not configured for this action.')
  return bus
}

export function createFinanceActionDefinitions() {
  return [
    {
      type: 'finance.transaction.review',
      confirm: ({ target }) => ({
        title: 'Review transaction',
        message: `Move ${target?.reference || target?.id || 'this transaction'} to review?`,
        confirmText: 'Review transaction',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getFinanceCommandBus(context).reviewTransaction(context.target?.id || context.id),
    },
    {
      type: 'finance.transaction.post',
      confirm: ({ target }) => ({
        title: 'Post transaction',
        message: `Post ${target?.reference || target?.id || 'this transaction'} to the ledger?`,
        confirmText: 'Post transaction',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getFinanceCommandBus(context).postTransaction(context.target?.id || context.id),
    },
    {
      type: 'finance.journal.reverse',
      confirm: ({ target }) => ({
        title: 'Reverse journal entry',
        message: `Reverse ${target?.entryNumber || target?.id || 'this journal entry'}?`,
        confirmText: 'Reverse entry',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getFinanceCommandBus(context).reverseJournalEntry(context.target?.id || context.id, context.payload?.reason),
    },
    {
      type: 'finance.transaction.delete-draft',
      confirm: ({ target }) => ({
        title: 'Delete draft transaction',
        message: `Delete ${target?.reference || target?.id || 'this draft transaction'}?`,
        confirmText: 'Delete draft',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getFinanceCommandBus(context).deleteDraftTransaction(context.target?.id || context.id),
    },
    {
      type: 'finance.period.close',
      confirm: ({ target }) => ({
        title: 'Close accounting period',
        message: `Close ${target?.key || target?.name || 'this accounting period'}?`,
        confirmText: 'Close period',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getFinanceCommandBus(context).closePeriod(context.target?.id || context.id),
    },
  ]
}

export default createFinanceActionDefinitions
