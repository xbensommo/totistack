/**
 * @file src/features/cms/services/cmsService.js
 * @description Honest root-store-first CMS core for pages and content types only.
 */
import { useAppStore } from '@app/stores/appStore/index.js'
import {
  assertAccess,
  createId,
  fetchDirectCollectionItems,
  normalizeError,
  slugify,
} from '../../shared/featureToolkit.js'
import { CMS_PERMISSIONS } from '../permissions.js'

export function createCmsService({ appStore, access, config = {} } = {}) {
  const store = appStore || useAppStore()
  const featureAccess = access || store?.access || null
  const pagesActions = store?.pagesActions
  if (!pagesActions) throw new Error('Missing root-store shard actions: store.pagesActions')
  const contentTypeActions = store?.contentTypesActions
  if (!contentTypeActions) throw new Error('Missing root-store shard actions: store.contentTypesActions')
  const settings = {
    routeBase: '/pages',
    ...config,
  }

  async function listPages(options = {}) {
    return fetchDirectCollectionItems(store, 'pages', pagesActions, options)
  }

  async function getPageById(pageId) {
    try {
      return await pagesActions.getById(pageId)
    } catch (error) {
      throw normalizeError(error, 'Unable to load the selected page.')
    }
  }

  async function getPageBySlug(slug) {
    const pages = await listPages({ filters: [{ field: 'slug', op: '==', value: slug }] })
    return pages.find((item) => item.slug === slug) || null
  }

  async function savePage(payload = {}) {
    try {
      const isUpdate = Boolean(payload.id)
      assertAccess(featureAccess, isUpdate ? CMS_PERMISSIONS.PAGES_UPDATE : CMS_PERMISSIONS.PAGES_CREATE)

      const now = new Date().toISOString()
      const pageId = payload.id || createId('page')
      const record = {
        title: String(payload.title || '').trim(),
        slug: String(payload.slug || slugify(payload.title || 'page')).trim(),
        path: payload.path || `${settings.routeBase}/${payload.slug || slugify(payload.title || 'page')}`,
        template: payload.template || 'default',
        blocks: Array.isArray(payload.blocks) ? payload.blocks : [],
        parentId: payload.parentId || null,
        showInNav: Boolean(payload.showInNav),
        navOrder: Number.isFinite(payload.navOrder) ? payload.navOrder : 0,
        navLabel: payload.navLabel || payload.title || 'Untitled page',
        seo: payload.seo || {},
        status: payload.status || 'draft',
        publishedAt: payload.status === 'published' ? (payload.publishedAt || now) : null,
        updatedAt: now,
      }

      if (!record.title) {
        throw new Error('Page title is required.')
      }

      if (isUpdate) {
        await pagesActions.update(pageId, record)
      } else {
        await pagesActions.setById(pageId, {
          ...record,
          version: 1,
          createdAt: now,
          createdBy: featureAccess?.uid || featureAccess?.id || null,
          updatedBy: featureAccess?.uid || featureAccess?.id || null,
        })
      }

      return { id: pageId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the page.')
    }
  }

  async function publishPage(pageId) {
    try {
      assertAccess(featureAccess, CMS_PERMISSIONS.PAGES_PUBLISH)
      await pagesActions.update(pageId, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return getPageById(pageId)
    } catch (error) {
      throw normalizeError(error, 'Unable to publish the page.')
    }
  }

  async function deletePage(pageId) {
    try {
      assertAccess(featureAccess, CMS_PERMISSIONS.PAGES_DELETE)
      return await pagesActions.remove(pageId)
    } catch (error) {
      throw normalizeError(error, 'Unable to delete the page.')
    }
  }

  async function listContentTypes(options = {}) {
    return fetchDirectCollectionItems(store, 'contentTypes', contentTypeActions, options)
  }

  async function saveContentType(payload = {}) {
    try {
      assertAccess(featureAccess, CMS_PERMISSIONS.CONTENT_TYPES_MANAGE)
      const now = new Date().toISOString()
      const contentTypeId = payload.id || createId('content_type')
      const record = {
        name: String(payload.name || '').trim(),
        slug: String(payload.slug || slugify(payload.name || 'content-type')).trim(),
        description: payload.description || '',
        fields: Array.isArray(payload.fields) ? payload.fields : [],
        displayField: payload.displayField || 'title',
        listFields: Array.isArray(payload.listFields) ? payload.listFields : ['title'],
        searchableFields: Array.isArray(payload.searchableFields) ? payload.searchableFields : ['title'],
        seoFields: payload.seoFields || {},
        permissions: payload.permissions || {},
        status: payload.status || 'published',
        updatedAt: now,
      }

      if (!record.name) throw new Error('Content type name is required.')

      if (payload.id) {
        await contentTypeActions.update(contentTypeId, record)
      } else {
        await contentTypeActions.setById(contentTypeId, {
          ...record,
          createdAt: now,
          createdBy: featureAccess?.uid || featureAccess?.id || null,
        })
      }

      return { id: contentTypeId, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the content type.')
    }
  }

  return {
    listPages,
    getPageById,
    getPageBySlug,
    savePage,
    publishPage,
    deletePage,
    listContentTypes,
    saveContentType,
  }
}

export default createCmsService
