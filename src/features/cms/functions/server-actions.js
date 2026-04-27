/** @file src/features/cms/functions/server-actions.js */

async function getDoc(ctx, collection, id, label = 'Record') {
  const ref = ctx.db.collection(collection).doc(id)
  const snap = await ref.get()
  if (!snap.exists) throw new Error(`${label} not found.`)
  return { ref, snap, data: snap.data() || {} }
}

async function createPageVersion(ctx, pageId, page, status = 'published') {
  const existing = await ctx.db.collection('cmsPageVersions').where('pageId', '==', pageId).get()
  const versionNumber = existing.size + 1
  const ref = ctx.db.collection('cmsPageVersions').doc()

  await ref.set({
    siteId: page.siteId || null,
    pageId,
    versionNumber,
    title: page.title,
    slug: page.slug,
    path: page.path,
    blocks: page.blocks || [],
    seo: page.seo || {},
    status,
    createdFrom: 'draft',
    metadata: page.metadata || {},
    createdAt: ctx.FieldValue.serverTimestamp(),
    updatedAt: ctx.FieldValue.serverTimestamp(),
    createdBy: ctx.auth.uid,
    updatedBy: ctx.auth.uid,
    isDeleted: false,
  })

  return { versionId: ref.id, versionNumber }
}

async function createEntryVersion(ctx, entryId, entry, status = 'published') {
  const existing = await ctx.db.collection('cmsEntryVersions').where('entryId', '==', entryId).get()
  const versionNumber = existing.size + 1
  const ref = ctx.db.collection('cmsEntryVersions').doc()

  await ref.set({
    siteId: entry.siteId || null,
    entryId,
    contentTypeId: entry.contentTypeId || null,
    versionNumber,
    title: entry.title,
    slug: entry.slug,
    fields: entry.fields || {},
    seo: entry.seo || {},
    status,
    metadata: entry.metadata || {},
    createdAt: ctx.FieldValue.serverTimestamp(),
    updatedAt: ctx.FieldValue.serverTimestamp(),
    createdBy: ctx.auth.uid,
    updatedBy: ctx.auth.uid,
    isDeleted: false,
  })

  return { versionId: ref.id, versionNumber }
}

async function notifyEditors(ctx, payload) {
  return ctx.notify({ recipientRole: 'cms.publisher', ...payload })
}

export const serverActions = [
  {
    id: 'cms.page.publish',
    label: 'Publish page',
    permission: 'cms.pages.publish',
    entityType: 'cmsPage',
    input: { required: ['pageId'] },
    requiresReason: false,
    async handler(ctx) {
      const page = await getDoc(ctx, 'cmsPages', ctx.input.pageId, 'Page')
      const version = await createPageVersion(ctx, ctx.input.pageId, page.data, 'published')
      await page.ref.update({ status: 'published', publishedVersionId: version.versionId, publishedAt: ctx.FieldValue.serverTimestamp(), publishedBy: ctx.auth.uid, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await notifyEditors(ctx, { type: 'cms.page.published', entityType: 'cmsPage', entityId: ctx.input.pageId, actionUrl: `/admin/cms/pages/${ctx.input.pageId}`, meta: { title: page.data.title || ctx.input.pageId } })
      return { pageId: ctx.input.pageId, status: 'published', ...version }
    },
  },
  {
    id: 'cms.page.unpublish',
    label: 'Unpublish page',
    permission: 'cms.pages.publish',
    entityType: 'cmsPage',
    input: { required: ['pageId'] },
    requiresReason: true,
    async handler(ctx) {
      const page = await getDoc(ctx, 'cmsPages', ctx.input.pageId, 'Page')
      await page.ref.update({ status: 'draft', publishedVersionId: null, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid, metadata: { ...(page.data.metadata || {}), unpublishReason: ctx.reason } })
      await notifyEditors(ctx, { type: 'cms.page.unpublished', entityType: 'cmsPage', entityId: ctx.input.pageId, actionUrl: `/admin/cms/pages/${ctx.input.pageId}`, meta: { title: page.data.title || ctx.input.pageId } })
      return { pageId: ctx.input.pageId, status: 'draft' }
    },
  },
  {
    id: 'cms.page.archive',
    label: 'Archive page',
    permission: 'cms.pages.archive',
    entityType: 'cmsPage',
    input: { required: ['pageId'] },
    requiresReason: true,
    async handler(ctx) {
      const page = await getDoc(ctx, 'cmsPages', ctx.input.pageId, 'Page')
      await page.ref.update({ status: 'archived', updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid, metadata: { ...(page.data.metadata || {}), archiveReason: ctx.reason } })
      await notifyEditors(ctx, { type: 'cms.page.archived', entityType: 'cmsPage', entityId: ctx.input.pageId, actionUrl: `/admin/cms/pages/${ctx.input.pageId}`, meta: { title: page.data.title || ctx.input.pageId } })
      return { pageId: ctx.input.pageId, status: 'archived' }
    },
  },
  {
    id: 'cms.page.restore',
    label: 'Restore page',
    permission: 'cms.pages.archive',
    entityType: 'cmsPage',
    input: { required: ['pageId'] },
    requiresReason: false,
    async handler(ctx) {
      const page = await getDoc(ctx, 'cmsPages', ctx.input.pageId, 'Page')
      await page.ref.update({ status: 'draft', isDeleted: false, deletedAt: null, deletedBy: null, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await notifyEditors(ctx, { type: 'cms.page.restored', entityType: 'cmsPage', entityId: ctx.input.pageId, actionUrl: `/admin/cms/pages/${ctx.input.pageId}`, meta: { title: page.data.title || ctx.input.pageId } })
      return { pageId: ctx.input.pageId, status: 'draft' }
    },
  },
  {
    id: 'cms.page.delete',
    label: 'Delete page',
    permission: 'cms.pages.delete',
    entityType: 'cmsPage',
    input: { required: ['pageId'] },
    requiresReason: true,
    async handler(ctx) {
      const page = await getDoc(ctx, 'cmsPages', ctx.input.pageId, 'Page')
      await page.ref.update({ status: 'deleted', isDeleted: true, deletedAt: ctx.FieldValue.serverTimestamp(), deletedBy: ctx.auth.uid, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid, metadata: { ...(page.data.metadata || {}), deleteReason: ctx.reason } })
      await notifyEditors(ctx, { type: 'cms.page.deleted', entityType: 'cmsPage', entityId: ctx.input.pageId, actionUrl: '/admin/cms/pages', meta: { title: page.data.title || ctx.input.pageId } })
      return { pageId: ctx.input.pageId, status: 'deleted' }
    },
  },
  {
    id: 'cms.entry.publish',
    label: 'Publish entry',
    permission: 'cms.entries.publish',
    entityType: 'cmsEntry',
    input: { required: ['entryId'] },
    requiresReason: false,
    async handler(ctx) {
      const entry = await getDoc(ctx, 'cmsEntries', ctx.input.entryId, 'Entry')
      const version = await createEntryVersion(ctx, ctx.input.entryId, entry.data, 'published')
      await entry.ref.update({ status: 'published', publishedVersionId: version.versionId, publishedAt: ctx.FieldValue.serverTimestamp(), publishedBy: ctx.auth.uid, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid })
      await notifyEditors(ctx, { type: 'cms.entry.published', entityType: 'cmsEntry', entityId: ctx.input.entryId, actionUrl: '/admin/cms/entries', meta: { title: entry.data.title || ctx.input.entryId } })
      return { entryId: ctx.input.entryId, status: 'published', ...version }
    },
  },
  {
    id: 'cms.entry.unpublish',
    label: 'Unpublish entry',
    permission: 'cms.entries.publish',
    entityType: 'cmsEntry',
    input: { required: ['entryId'] },
    requiresReason: true,
    async handler(ctx) {
      const entry = await getDoc(ctx, 'cmsEntries', ctx.input.entryId, 'Entry')
      await entry.ref.update({ status: 'draft', publishedVersionId: null, updatedAt: ctx.FieldValue.serverTimestamp(), updatedBy: ctx.auth.uid, metadata: { ...(entry.data.metadata || {}), unpublishReason: ctx.reason } })
      await notifyEditors(ctx, { type: 'cms.entry.unpublished', entityType: 'cmsEntry', entityId: ctx.input.entryId, actionUrl: '/admin/cms/entries', meta: { title: entry.data.title || ctx.input.entryId } })
      return { entryId: ctx.input.entryId, status: 'draft' }
    },
  },
  {
    id: 'cms.redirect.create_from_slug_change',
    label: 'Create redirect from slug change',
    permission: 'cms.redirects.manage',
    entityType: 'cmsRedirect',
    input: { required: ['siteId', 'fromPath', 'toPath'] },
    requiresReason: false,
    async handler(ctx) {
      if (ctx.input.fromPath === ctx.input.toPath) throw new Error('fromPath and toPath cannot be the same.')
      const ref = await ctx.db.collection('cmsRedirects').add({
        siteId: ctx.input.siteId,
        fromPath: ctx.input.fromPath,
        toPath: ctx.input.toPath,
        statusCode: Number(ctx.input.statusCode || 301),
        status: 'active',
        reason: ctx.reason || 'slug-change',
        metadata: ctx.input.metadata || {},
        createdAt: ctx.FieldValue.serverTimestamp(),
        updatedAt: ctx.FieldValue.serverTimestamp(),
        createdBy: ctx.auth.uid,
        updatedBy: ctx.auth.uid,
        isDeleted: false,
      })
      await notifyEditors(ctx, { type: 'cms.redirect.created', entityType: 'cmsRedirect', entityId: ref.id, actionUrl: '/admin/cms/redirects', meta: { fromPath: ctx.input.fromPath, toPath: ctx.input.toPath } })
      return { redirectId: ref.id, fromPath: ctx.input.fromPath, toPath: ctx.input.toPath }
    },
  },
]

export default serverActions
