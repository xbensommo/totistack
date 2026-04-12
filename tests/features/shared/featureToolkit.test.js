import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getCollectionActions,
  runAction,
  getCollectionItems,
  fetchCollectionItems,
  assertAccess,
  createId,
  slugify,
  createLegacyService,
  normalizeError,
} from '../../../src/features/shared/featureToolkit.js'

test('getCollectionActions resolves direct keyed actions first', () => {
  const direct = { fetchInitialPage() {} }
  const appStore = {
    formsActions: direct,
    collectionsActions: {
      forms: { fetchInitialPage() { throw new Error('should not use generated fallback') } },
    },
  }

  assert.equal(getCollectionActions(appStore, 'forms'), direct)
})

test('getCollectionActions falls back to collectionsActions map', () => {
  const generated = { fetchInitialPage() {} }
  const appStore = {
    collectionsActions: {
      forms: generated,
    },
  }

  assert.equal(getCollectionActions(appStore, 'forms'), generated)
})

test('runAction calls the first available action method', async () => {
  const actions = {
    update: async (id, payload) => ({ id, payload }),
  }

  const result = await runAction(actions, ['setById', 'create', 'update'], 'abc', { name: 'Demo' })
  assert.deepEqual(result, {
    id: 'abc',
    payload: { name: 'Demo' },
  })
})

test('runAction throws when none of the requested methods exist', async () => {
  await assert.rejects(
    () => runAction({}, ['setById', 'create']),
    /Required collection action is missing/,
  )
})

test('getCollectionItems normalizes common state shapes', () => {
  assert.deepEqual(getCollectionItems({ forms: [{ id: 1 }] }, 'forms'), [{ id: 1 }])
  assert.deepEqual(getCollectionItems({ forms: { items: [{ id: 2 }] } }, 'forms'), [{ id: 2 }])
  assert.deepEqual(getCollectionItems({ forms: { value: { items: [{ id: 3 }] } } }, 'forms'), [{ id: 3 }])
  assert.deepEqual(getCollectionItems({ forms: { value: [{ id: 4 }] } }, 'forms'), [{ id: 4 }])
  assert.deepEqual(getCollectionItems({}, 'forms'), [])
})

test('fetchCollectionItems triggers fetchInitialPage when available and returns normalized items', async () => {
  const state = {
    forms: { items: [{ id: 'one' }] },
    formsActions: {
      async fetchInitialPage(options) {
        assert.deepEqual(options, { limit: 5 })
      },
    },
  }

  const items = await fetchCollectionItems(state, 'forms', { limit: 5 })
  assert.deepEqual(items, [{ id: 'one' }])
})

test('assertAccess throws when active access layer denies the requirement', () => {
  assert.throws(
    () => assertAccess({ enabled: true, can: () => false }, 'forms.manage', 'Denied'),
    /Denied/,
  )
})

test('assertAccess is a no-op when access layer is disabled', () => {
  assert.doesNotThrow(() => {
    assertAccess({ enabled: false, can: () => false }, 'forms.manage')
  })
})

test('createId prefixes identifiers and keeps them non-empty', () => {
  const id = createId('search')
  assert.match(id, /^search_/)
  assert.ok(id.length > 'search_'.length)
})

test('slugify produces URL-safe slugs', () => {
  assert.equal(slugify('  Search Console 2026!  '), 'search-console-2026')
})

test('createLegacyService proxies methods and binds this correctly', async () => {
  const service = {
    count: 2,
    getCount() {
      return this.count
    },
  }

  const proxy = createLegacyService(() => service)
  assert.equal(proxy.getCount(), 2)
})

test('normalizeError returns a stable Error instance', () => {
  const existing = new Error('Existing')
  assert.equal(normalizeError(existing), existing)
  assert.equal(normalizeError('Plain string').message, 'Plain string')
  assert.equal(normalizeError({ message: 'Object message' }).message, 'Object message')
  assert.equal(normalizeError({}).message, 'Fallback message')
})
