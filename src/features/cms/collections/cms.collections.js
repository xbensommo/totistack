/** @file src/features/cms/collections/cms.collections.js */
import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const S = FIELD_TYPES.STRING
const N = FIELD_TYPES.NUMBER
const B = FIELD_TYPES.BOOLEAN
const T = FIELD_TYPES.TIMESTAMP
const A = FIELD_TYPES.ARRAY
const M = FIELD_TYPES.MAP

function field(type, extra = {}) {
  return { type, ...extra }
}

function withSystem(schema) {
  return {
    ...schema,
    createdAt: field(T, { readonly: true, system: true, filterable: true, sortable: true }),
    updatedAt: field(T, { readonly: true, system: true, filterable: true, sortable: true }),
    createdBy: field(S, { readonly: true, system: true, filterable: true }),
    updatedBy: field(S, { readonly: true, system: true, filterable: true }),
    isDeleted: field(B, { filterable: true, sortable: true }),
    deletedAt: field(T, { filterable: true, sortable: true }),
    deletedBy: field(S, { filterable: true }),
  }
}

function collection(name, schema, writableFields, updateableFields, indexes, searchFields = []) {
  return defineCollection({
    name,
    shard: { type: 'none' },
    schema: withSystem(schema),
    writableFields,
    updateableFields,
    indexes,
    search: searchFields.length ? { mode: 'token-array', fields: searchFields } : { mode: 'disabled', fields: [] },
    rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'adminOnly' },
  })
}

export const cmsSites = collection(
  'cmsSites',
  {
    name: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    primaryDomain: field(S, { searchable: true, filterable: true }),
    status: field(S, { required: true, sortable: true, filterable: true }),
    locale: field(S, { filterable: true }),
    settings: field(M),
    seoDefaults: field(M),
  },
  ['name', 'slug', 'primaryDomain', 'status', 'locale', 'settings', 'seoDefaults'],
  ['name', 'slug', 'primaryDomain', 'status', 'locale', 'settings', 'seoDefaults', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['slug'] }, { fields: ['status', 'createdAt'] }],
  ['name', 'slug', 'primaryDomain'],
)

export const cmsPages = collection(
  'cmsPages',
  {
    siteId: field(S, { required: true, filterable: true }),
    title: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    path: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    status: field(S, { required: true, sortable: true, filterable: true }),
    blocks: field(A),
    seo: field(M),
    publishedVersionId: field(S, { filterable: true }),
    draftVersionId: field(S, { filterable: true }),
    scheduledAt: field(T, { sortable: true, filterable: true }),
    publishedAt: field(T, { sortable: true, filterable: true }),
    publishedBy: field(S, { filterable: true }),
    metadata: field(M),
  },
  ['siteId', 'title', 'slug', 'path', 'status', 'blocks', 'seo', 'publishedVersionId', 'draftVersionId', 'scheduledAt', 'publishedAt', 'publishedBy', 'metadata'],
  ['title', 'slug', 'path', 'status', 'blocks', 'seo', 'publishedVersionId', 'draftVersionId', 'scheduledAt', 'publishedAt', 'publishedBy', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['siteId', 'path'] }, { fields: ['siteId', 'status', 'updatedAt'] }, { fields: ['slug', 'createdAt'] }],
  ['title', 'slug', 'path'],
)

export const cmsPageVersions = collection(
  'cmsPageVersions',
  {
    siteId: field(S, { required: true, filterable: true }),
    pageId: field(S, { required: true, filterable: true }),
    versionNumber: field(N, { required: true, sortable: true, filterable: true }),
    title: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    path: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    blocks: field(A),
    seo: field(M),
    status: field(S, { required: true, filterable: true }),
    createdFrom: field(S, { filterable: true }),
    metadata: field(M),
  },
  ['siteId', 'pageId', 'versionNumber', 'title', 'slug', 'path', 'blocks', 'seo', 'status', 'createdFrom', 'metadata'],
  ['metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['pageId', 'versionNumber'] }, { fields: ['siteId', 'status', 'createdAt'] }],
  ['title', 'slug', 'path'],
)

export const cmsContentTypes = collection(
  'cmsContentTypes',
  {
    siteId: field(S, { required: true, filterable: true }),
    name: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    description: field(S, { searchable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    fields: field(A, { required: true }),
    settings: field(M),
  },
  ['siteId', 'name', 'slug', 'description', 'status', 'fields', 'settings'],
  ['name', 'slug', 'description', 'status', 'fields', 'settings', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['siteId', 'slug'] }, { fields: ['siteId', 'status', 'createdAt'] }],
  ['name', 'slug', 'description'],
)

export const cmsEntries = collection(
  'cmsEntries',
  {
    siteId: field(S, { required: true, filterable: true }),
    contentTypeId: field(S, { required: true, filterable: true }),
    title: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    fields: field(M, { required: true }),
    seo: field(M),
    publishedVersionId: field(S, { filterable: true }),
    publishedAt: field(T, { sortable: true, filterable: true }),
    publishedBy: field(S, { filterable: true }),
    metadata: field(M),
  },
  ['siteId', 'contentTypeId', 'title', 'slug', 'status', 'fields', 'seo', 'publishedVersionId', 'publishedAt', 'publishedBy', 'metadata'],
  ['title', 'slug', 'status', 'fields', 'seo', 'publishedVersionId', 'publishedAt', 'publishedBy', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['contentTypeId', 'status', 'updatedAt'] }, { fields: ['siteId', 'slug'] }, { fields: ['siteId', 'status', 'updatedAt'] }],
  ['title', 'slug'],
)

export const cmsEntryVersions = collection(
  'cmsEntryVersions',
  {
    siteId: field(S, { required: true, filterable: true }),
    entryId: field(S, { required: true, filterable: true }),
    contentTypeId: field(S, { required: true, filterable: true }),
    versionNumber: field(N, { required: true, sortable: true, filterable: true }),
    title: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    fields: field(M, { required: true }),
    seo: field(M),
    status: field(S, { required: true, filterable: true }),
    metadata: field(M),
  },
  ['siteId', 'entryId', 'contentTypeId', 'versionNumber', 'title', 'slug', 'fields', 'seo', 'status', 'metadata'],
  ['metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['entryId', 'versionNumber'] }, { fields: ['contentTypeId', 'createdAt'] }],
  ['title', 'slug'],
)

export const cmsMenus = collection(
  'cmsMenus',
  {
    siteId: field(S, { required: true, filterable: true }),
    name: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    handle: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    items: field(A, { required: true }),
    metadata: field(M),
  },
  ['siteId', 'name', 'handle', 'status', 'items', 'metadata'],
  ['name', 'handle', 'status', 'items', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['siteId', 'handle'] }, { fields: ['siteId', 'status', 'createdAt'] }],
  ['name', 'handle'],
)

export const cmsRedirects = collection(
  'cmsRedirects',
  {
    siteId: field(S, { required: true, filterable: true }),
    fromPath: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    toPath: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    statusCode: field(N, { required: true, sortable: true, filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    reason: field(S, { searchable: true }),
    metadata: field(M),
  },
  ['siteId', 'fromPath', 'toPath', 'statusCode', 'status', 'reason', 'metadata'],
  ['fromPath', 'toPath', 'statusCode', 'status', 'reason', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['siteId', 'fromPath'] }, { fields: ['siteId', 'status', 'createdAt'] }],
  ['fromPath', 'toPath', 'reason'],
)

export const cmsCollections = Object.freeze([
  cmsSites,
  cmsPages,
  cmsPageVersions,
  cmsContentTypes,
  cmsEntries,
  cmsEntryVersions,
  cmsMenus,
  cmsRedirects,
])

export default cmsCollections
