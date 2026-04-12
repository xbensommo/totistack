/**
 * @file search/services/searchService.js
 * @description Root-store compatible service factory for the search feature.
 */
import { useAppStore } from '@/stores/appStore'
import {
  assertAccess,
  createId,
  createLegacyService,
  fetchCollectionItems,
  getCollectionActions,
  normalizeError,
  runAction,
} from '../../shared/featureToolkit.js'

/**
 * Create the search feature service.
 *
 * @param {object} context
 * @returns {object}
 */
export function createSearchService({ appStore, access, config = {} } = {}) {
  const store = appStore || useAppStore()
  const featureAccess = access || store?.access || null
  const indexActions = getCollectionActions(store, 'searchIndexes')
  const queryActions = getCollectionActions(store, 'searchQueries')
  const synonymActions = getCollectionActions(store, 'searchSynonyms')
  const settings = { defaultLimit: 20, maxLimit: 100, ...config }

  async function listIndexes(options = {}) {
    return fetchCollectionItems(store, 'searchIndexes', options)
  }

  async function listSynonyms(options = {}) {
    return fetchCollectionItems(store, 'searchSynonyms', options)
  }

  async function indexDocument(payload) {
    try {
      assertAccess(featureAccess, 'search.manage', 'You are not allowed to update search indexes.')
      const id = payload.id || createId('search-index')
      const record = {
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        title: payload.title,
        summary: payload.summary || '',
        content: payload.content || '',
        tokens: payload.tokens || tokenize(`${payload.title || ''} ${payload.summary || ''} ${payload.content || ''}`),
        facets: payload.facets || {},
        scoreBoost: payload.scoreBoost || 0,
        isPublished: payload.isPublished !== false,
        updatedAt: new Date().toISOString(),
      }
      if (payload.id) {
        await runAction(indexActions, ['update'], id, record)
      } else {
        await runAction(indexActions, ['setById', 'create', 'add'], id, { ...record, createdAt: record.updatedAt })
      }
      return { id, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to update the search index.')
    }
  }

  async function saveSynonym(payload) {
    try {
      assertAccess(featureAccess, 'search.manage', 'You are not allowed to manage search synonyms.')
      const id = payload.id || createId('synonym')
      const record = {
        term: String(payload.term || '').trim().toLowerCase(),
        synonyms: Array.isArray(payload.synonyms) ? payload.synonyms.map((item) => String(item).trim().toLowerCase()).filter(Boolean) : [],
        language: payload.language || 'en',
        isActive: payload.isActive !== false,
        updatedAt: new Date().toISOString(),
      }
      if (!record.term) {
        throw new Error('A search term is required.')
      }
      if (payload.id) {
        await runAction(synonymActions, ['update'], id, record)
      } else {
        await runAction(synonymActions, ['setById', 'create', 'add'], id, { ...record, createdAt: record.updatedAt })
      }
      return { id, ...record }
    } catch (error) {
      throw normalizeError(error, 'Unable to save the search synonym.')
    }
  }

  async function search(query, options = {}) {
    try {
      const raw = String(query || '').trim()
      const pageSize = Math.min(options.pageSize || settings.defaultLimit, settings.maxLimit)
      const indexes = await listIndexes()
      const synonyms = await listSynonyms()
      const expandedTokens = expandTokens(tokenize(raw), synonyms)
      const results = indexes
        .filter((item) => item.isPublished !== false)
        .map((item) => ({
          ...item,
          _score: computeScore(item, expandedTokens),
        }))
        .filter((item) => item._score > 0)
        .sort((left, right) => right._score - left._score)
        .slice(0, pageSize)

      await runAction(queryActions, ['setById', 'create', 'add'], createId('query'), {
        query: raw,
        resultCount: results.length,
        filters: options.filters || {},
        source: options.source || 'ui',
        createdAt: new Date().toISOString(),
      })

      return {
        results,
        total: results.length,
        tokens: expandedTokens,
      }
    } catch (error) {
      throw normalizeError(error, 'Unable to run the search query.')
    }
  }

  return {
    settings,
    listIndexes,
    listSynonyms,
    indexDocument,
    saveSynonym,
    search,
  }
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function expandTokens(tokens, synonyms) {
  const expanded = new Set(tokens)
  for (const synonym of synonyms) {
    if (!synonym.isActive) continue
    if (expanded.has(synonym.term)) {
      for (const item of synonym.synonyms || []) {
        expanded.add(item)
      }
    }
  }
  return [...expanded]
}

function computeScore(indexRecord, tokens) {
  const haystack = new Set([...(indexRecord.tokens || []), ...tokenize(indexRecord.title), ...tokenize(indexRecord.summary), ...tokenize(indexRecord.content)])
  let score = Number(indexRecord.scoreBoost || 0)
  for (const token of tokens) {
    if (haystack.has(token)) {
      score += 10
    }
  }
  return score
}

const legacyService = createLegacyService(() => createSearchService({ appStore: useAppStore() }))
export default legacyService
