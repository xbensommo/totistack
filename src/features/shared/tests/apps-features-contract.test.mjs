/**
 * @file src/features/shared/tests/apps-features-contract.test.mjs
 * @description Static guardrails for Totistack app/feature modules.
 *
 * Run from the project root:
 *   node src/features/shared/tests/apps-features-contract.test.mjs
 */

import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const srcRoot = resolve(here, '../../..')
const moduleRoots = [join(srcRoot, 'apps'), join(srcRoot, 'features')].filter(existsSync)

const JS_EXTENSIONS = new Set(['.js', '.mjs', '.vue'])

function walk(dir, output = []) {
  if (!existsSync(dir)) return output

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      output.push(path)
      walk(path, output)
      continue
    }

    output.push(path)
  }

  return output
}

function ext(path) {
  const index = path.lastIndexOf('.')
  return index >= 0 ? path.slice(index) : ''
}

const allPaths = moduleRoots.flatMap((root) => walk(root))
const files = allPaths.filter((path) => statSync(path).isFile())
const sourceFiles = files.filter((path) => JS_EXTENSIONS.has(ext(path)) && !path.endsWith('apps-features-contract.test.mjs'))
const relativeFiles = sourceFiles.map((path) => relative(srcRoot, path).replaceAll('\\', '/'))

function read(path) {
  return readFileSync(path, 'utf8')
}

function failList(title, values) {
  assert.equal(values.length, 0, `${title}:\n${values.map((item) => `- ${item}`).join('\n')}`)
}

const forbiddenFolders = allPaths
  .filter((path) => statSync(path).isDirectory())
  .map((path) => relative(srcRoot, path).replaceAll('\\', '/'))
  .filter((path) => /(^|\/).*?-ui-beautified($|\/)/.test(path) || path === 'apps/portal' || path === 'apps/modules' || path === 'apps/core' || path === 'features/core')

failList('Forbidden duplicate/demo folders found', forbiddenFolders)

const forbiddenFiles = relativeFiles.filter((path) => (
  path.endsWith('/crm.service.js') ||
  path.endsWith('dashboard-ui-beautified.zip')
))

failList('Forbidden legacy files found', forbiddenFiles)

const forbiddenActionPatterns = [
  ['collectionsActions', /collectionsActions/],
  ['callFirstAvailable', /callFirstAvailable/],
]

for (const [label, pattern] of forbiddenActionPatterns) {
  const hits = sourceFiles
    .filter((path) => pattern.test(read(path)))
    .map((path) => relative(srcRoot, path).replaceAll('\\', '/'))

  failList(`Forbidden pattern "${label}" found`, hits)
}

const serviceWrapperHits = sourceFiles
  .filter((path) => /\/(apps|features)\/.+\/services\//.test(relative(srcRoot, path).replaceAll('\\', '/')))
  .filter((path) => /getCollectionActions|fetchCollectionItems/.test(read(path)))
  .map((path) => relative(srcRoot, path).replaceAll('\\', '/'))

failList('Services must use direct store.<collectionName>Actions access, not old helper wrappers', serviceWrapperHits)

const decisionActionFiles = [
  'apps/booking/booking.actions.js',
  'apps/orders/order.actions.js',
  'apps/client-records/client-records.actions.js',
  'apps/finance/finance.actions.js',
  'apps/crm/crm.actions.js',
  'features/auth/auth.actions.js',
  'features/cms/cms.actions.js',
  'features/forms/forms.actions.js',
  'features/media/media.actions.js',
  'features/integrations/integrations.actions.js',
  'features/workflows/workflows.actions.js',
  'features/search/search.actions.js',
  'features/notifications/notifications.actions.js',
]

failList(
  'Required action-modal definition files are missing',
  decisionActionFiles.filter((path) => !existsSync(join(srcRoot, path))),
)

const decisionWords = ['update', 'delete', 'remove', 'archive', 'reverse', 'transfer', 'refund', 'cancel', 'publish', 'post', 'close', 'assign', 'complete']
const serviceDecisionFiles = relativeFiles
  .filter((path) => /\/services\/.+\.js$/.test(path))
  .filter((path) => {
    const source = read(join(srcRoot, path))
    return decisionWords.some((word) => new RegExp(`\\b(async\\s+function|function)\\s+\\w*${word}\\w*\\s*\\(`, 'i').test(source))
  })

assert.ok(
  decisionActionFiles.length >= 10,
  `Expected module action definitions for decision workflows. Found ${decisionActionFiles.length}.`,
)

console.log(JSON.stringify({
  ok: true,
  checkedFiles: relativeFiles.length,
  serviceDecisionFiles: serviceDecisionFiles.length,
  actionDefinitionFiles: decisionActionFiles.length,
}, null, 2))
