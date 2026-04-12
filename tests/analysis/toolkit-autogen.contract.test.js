import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs/promises'
import path from 'path'

const root = process.cwd()

test('shared toolkit exists as a plain folder asset but is not a registry-backed feature', async () => {
  const toolkitPath = path.join(root, 'src', 'features', 'shared', 'featureToolkit.js')
  const manifestPath = path.join(root, 'src', 'features', 'shared', 'feature.manifest.js')

  const toolkitExists = await fs.access(toolkitPath).then(() => true).catch(() => false)
  const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false)

  assert.equal(toolkitExists, true)
  assert.equal(manifestExists, false)
})

test('project base template does not scaffold src/features/shared/featureToolkit.js by default', async () => {
  const templateToolkitPath = path.join(
    root,
    'src',
    'templates',
    'project',
    'base',
    'vue',
    'src',
    'features',
    'shared',
    'featureToolkit.js.tpl',
  )

  const exists = await fs.access(templateToolkitPath).then(() => true).catch(() => false)
  assert.equal(exists, false)
})

test('feature installer only copies registry-selected feature directories', async () => {
  const installerPath = path.join(root, 'src', 'core', 'installer', 'feature-installer.js')
  const content = await fs.readFile(installerPath, 'utf8')

  assert.match(content, /const srcDir = featureEntry\.dir;/)
  assert.match(content, /copyDir\(srcDir, destDir\)/)
  assert.doesNotMatch(content, /features\/shared/)
})
