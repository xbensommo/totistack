/** @file src/features/cms/cms.actions.js */

function getCmsService(context) {
  const service = context?.service || context?.services?.cms || context?.services?.cmsService
  if (!service) throw new Error('CMS service is not configured for this action.')
  return service
}

function targetId(context) {
  return context?.target?.id || context?.id
}

export function createCmsActionDefinitions() {
  return [
    {
      type: 'cms.page.update',
      confirm: ({ target }) => ({
        title: 'Update page',
        message: `Update ${target?.title || 'this page'}?`,
        confirmText: 'Update page',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getCmsService(context).savePage({ ...(context.payload || {}), id: targetId(context) }),
    },
    {
      type: 'cms.page.publish',
      confirm: ({ target }) => ({
        title: 'Publish page',
        message: `Publish ${target?.title || 'this page'}?`,
        confirmText: 'Publish page',
        cancelText: 'Cancel',
        variant: 'success',
      }),
      run: (context) => getCmsService(context).publishPage(targetId(context)),
    },
    {
      type: 'cms.page.delete',
      confirm: ({ target }) => ({
        title: 'Delete page',
        message: `Delete ${target?.title || 'this page'}? This cannot be undone.`,
        confirmText: 'Delete page',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getCmsService(context).deletePage(targetId(context)),
    },
    {
      type: 'cms.content-type.save',
      confirm: ({ target }) => ({
        title: 'Save content type',
        message: `Save ${target?.name || 'this content type'}?`,
        confirmText: 'Save content type',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getCmsService(context).saveContentType({ ...(context.payload || {}), id: targetId(context) }),
    },
  ]
}

export default createCmsActionDefinitions
