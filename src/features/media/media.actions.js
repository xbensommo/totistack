/** @file src/features/media/media.actions.js */

function getMediaService(context) {
  const service = context?.service || context?.services?.media || context?.services?.mediaService
  if (!service) throw new Error('Media service is not configured for this action.')
  return service
}

export function createMediaActionDefinitions() {
  return [
    {
      type: 'media.file.save',
      confirm: ({ target }) => ({
        title: 'Save media file',
        message: `Save ${target?.name || 'this media file'}?`,
        confirmText: 'Save file',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getMediaService(context).saveFile({ ...(context.payload || {}), id: context.target?.id || context.id || context.payload?.id }),
    },
    {
      type: 'media.file.remove',
      confirm: ({ target }) => ({
        title: 'Remove media file',
        message: `Remove ${target?.name || 'this media file'}?`,
        confirmText: 'Remove file',
        cancelText: 'Cancel',
        variant: 'danger',
      }),
      run: (context) => getMediaService(context).removeFile(context.target?.id || context.id || context.fileId),
    },
    {
      type: 'media.folder.create',
      confirm: ({ payload }) => ({
        title: 'Create media folder',
        message: `Create folder ${payload?.name || 'Untitled folder'}?`,
        confirmText: 'Create folder',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getMediaService(context).createFolder(context.payload || {}),
    },
  ]
}

export default createMediaActionDefinitions
