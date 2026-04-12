import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs/promises'
import path from 'path'

const root = process.cwd()

test('router helper currently initializes access runtime before it knows whether the route needs auth', async () => {
  const routerHelperPath = path.join(
    root,
    'src',
    'templates',
    'project',
    'base',
    'vue',
    'src',
    'app',
    'router',
    'router-helper.js.tpl',
  )

  const content = await fs.readFile(routerHelperPath, 'utf8')

  const initIndex = content.indexOf('await store.initAccessRuntime()')
  const waitIndex = content.indexOf('await store.waitForAccessReady()')
  const requiresAuthIndex = content.indexOf('const requiresAuth = Boolean(to.meta?.requiresAuth)')

  assert.ok(initIndex >= 0, 'expected initAccessRuntime call to exist')
  assert.ok(waitIndex >= 0, 'expected waitForAccessReady call to exist')
  assert.ok(requiresAuthIndex >= 0, 'expected requiresAuth calculation to exist')

  assert.ok(initIndex < requiresAuthIndex)
  assert.ok(waitIndex < requiresAuthIndex)
})
