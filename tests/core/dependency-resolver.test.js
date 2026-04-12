import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveDependencies } from '../../src/core/resolver/dependency-resolver.js'

function createRegistry(entries) {
  return {
    get(id) {
      return entries.get(id) || null
    },
    getAll() {
      return Array.from(entries.values())
    },
    has(id) {
      return entries.has(id)
    },
  }
}

test('resolveDependencies expands features required by an app manifest', () => {
  const appRegistry = createRegistry(new Map([
    ['crm', { id: 'crm', manifest: { features: ['auth'] } }],
  ]))
  const featureRegistry = createRegistry(new Map([
    ['auth', { id: 'auth', manifest: {} }],
  ]))

  const result = resolveDependencies(['crm'], [], appRegistry, featureRegistry)

  assert.deepEqual(result.apps, ['crm'])
  assert.deepEqual(result.features, ['auth'])
})

test('resolveDependencies expands apps required by a feature manifest using requiresApps', () => {
  const appRegistry = createRegistry(new Map([
    ['dashboard', { id: 'dashboard', manifest: {} }],
  ]))
  const featureRegistry = createRegistry(new Map([
    ['analytics', { id: 'analytics', manifest: { requiresApps: ['dashboard'] } }],
  ]))

  const result = resolveDependencies([], ['analytics'], appRegistry, featureRegistry)

  assert.deepEqual(result.apps, ['dashboard'])
  assert.deepEqual(result.features, ['analytics'])
})

test('current resolver does not expand feature-to-feature dependencies declared under manifest.dependencies.features', () => {
  const appRegistry = createRegistry(new Map())
  const featureRegistry = createRegistry(new Map([
    ['search', { id: 'search', manifest: { dependencies: { features: ['auth', 'rbac'] } } }],
    ['auth', { id: 'auth', manifest: {} }],
    ['rbac', { id: 'rbac', manifest: {} }],
  ]))

  const result = resolveDependencies([], ['search'], appRegistry, featureRegistry)

  assert.deepEqual(result.features, ['search'])
})
