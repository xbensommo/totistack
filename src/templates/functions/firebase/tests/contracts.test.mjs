import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, files)
    else if (path.endsWith('.js')) files.push(path)
  }
  return files
}

test('generated registry does not contain client/project brands', () => {
  const registry = readFileSync(join(root, 'src/generated/server-actions.registry.js'), 'utf8')
  assert.equal(/nangura|nambid|totisoft/i.test(registry), false)
})

test('functions source has no old copy-file naming', () => {
  const files = walk(join(root, 'src'))
  assert.equal(files.some((file) => /copy/i.test(file)), false)
})

test('core files export expected functions', () => {
  const index = readFileSync(join(root, 'src/index.js'), 'utf8')
  for (const name of [
    'serverActionRun',
    'notificationRegisterToken',
    'notificationRevokeToken',
    'notificationsOnCreate',
    'notificationRetryFailedDeliveries',
    'notificationCleanupTokens',
  ]) {
    assert.match(index, new RegExp(`export const ${name}`))
  }
})
