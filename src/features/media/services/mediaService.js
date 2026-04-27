/**
 * @file media/services/mediaService.js
 * @description Root-store compatible service factory for the media feature.
 */
import { useAppStore } from '@app/stores/appStore'
import {
  assertAccess,
  createId,
  fetchDirectCollectionItems,
  normalizeError,
  slugify,
} from '../../shared/featureToolkit.js'

/**
 * Create the media feature service.
 *
 * @param {object} context
 * @returns {object}
 */
export function createMediaService({ appStore, access, config = {} } = {}) {
  const store = appStore || useAppStore()
  const featureAccess = access || store?.access || null
  const fileActions = store?.mediaFilesActions
  if (!fileActions) throw new Error('Missing root-store shard actions: store.mediaFilesActions')
  const folderActions = store?.mediaFoldersActions
  if (!folderActions) throw new Error('Missing root-store shard actions: store.mediaFoldersActions')
  const settings = { maxFileSize: 10 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], ...config }

  async function listFiles(options = {}) {
    return fetchDirectCollectionItems(store, 'mediaFiles', fileActions, options)
  }

  async function listFolders(options = {}) {
    return fetchDirectCollectionItems(store, 'mediaFolders', folderActions, options)
  }

  async function createFolder(payload) {
    try {
      assertAccess(featureAccess, 'media.manage', 'You are not allowed to create media folders.')
      const folderId = createId('folder')
      const record = {
        name: payload.name?.trim() || 'Untitled folder',
        slug: payload.slug?.trim() || slugify(payload.name || 'untitled-folder'),
        parentId: payload.parentId || '',
        visibility: payload.visibility || 'private',
        description: payload.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await folderActions.setById(folderId, record)
      return { id: folderId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to create the media folder.')
    }
  }

  async function saveFile(payload) {
    try {
      assertAccess(featureAccess, 'media.manage', 'You are not allowed to manage media files.')
      if (payload.size && payload.size > settings.maxFileSize) {
        throw new Error(`File exceeds the configured limit of ${settings.maxFileSize} bytes.`)
      }
      if (payload.mimeType && !settings.allowedMimeTypes.includes(payload.mimeType)) {
        throw new Error(`Unsupported file type: ${payload.mimeType}`)
      }
      const fileId = payload.id || createId('media')
      const record = {
        folderId: payload.folderId || '',
        name: payload.name?.trim() || payload.originalName || 'Untitled asset',
        originalName: payload.originalName || payload.name || 'file',
        mimeType: payload.mimeType || 'application/octet-stream',
        extension: payload.extension || '',
        size: payload.size || 0,
        storagePath: payload.storagePath || '',
        publicUrl: payload.publicUrl || '',
        altText: payload.altText || '',
        tags: payload.tags || [],
        metadata: payload.metadata || {},
        updatedAt: new Date().toISOString(),
      }
      if (!record.storagePath) {
        throw new Error('A storage path is required for media records.')
      }
      if (payload.id) {
        await fileActions.update(fileId, record)
      } else {
        await fileActions.setById(fileId, { ...record, createdAt: record.updatedAt })
      }
      return { id: fileId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the media file.')
    }
  }

  async function removeFile(fileId) {
    try {
      assertAccess(featureAccess, 'media.manage', 'You are not allowed to delete media files.')
      await fileActions.remove(fileId)
      return true
    } catch (error) {
      throw normalizeError(error, 'Unable to remove the media file.')
    }
  }

  return {
    settings,
    listFiles,
    listFolders,
    createFolder,
    saveFile,
    removeFile,
  }
}

export default createMediaService
