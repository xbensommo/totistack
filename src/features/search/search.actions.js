/** @file src/features/search/search.actions.js */

function getSearchService(context) {
  const service = context?.service || context?.services?.search || context?.services?.searchService
  if (!service) throw new Error('Search service is not configured for this action.')
  return service
}

export function createSearchActionDefinitions() {
  return [
    {
      type: 'search.index.update',
      confirm: ({ target, payload }) => ({
        title: 'Update search index',
        message: `Update search index for ${target?.title || payload?.title || 'this resource'}?`,
        confirmText: 'Update index',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getSearchService(context).indexDocument({ ...(context.payload || {}), id: context.target?.id || context.id || context.payload?.id }),
    },
    {
      type: 'search.synonym.save',
      confirm: ({ target, payload }) => ({
        title: 'Save synonym',
        message: `Save synonym ${target?.term || payload?.term || 'entry'}?`,
        confirmText: 'Save synonym',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getSearchService(context).saveSynonym({ ...(context.payload || {}), id: context.target?.id || context.id || context.payload?.id }),
    },
  ]
}

export default createSearchActionDefinitions
