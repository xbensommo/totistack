import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { generateAssemblyArtifacts } from '../../src/core/generators/assembly-generator.js'

test('generateAssemblyArtifacts writes all generated registry files', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'totistack-assembly-'))
  const generatedDir = path.join(tempRoot, 'src', 'generated')
  await fs.mkdir(generatedDir, { recursive: true })

  await generateAssemblyArtifacts(tempRoot)

  for (const fileName of ['collections.js', 'routes.js', 'services.js', 'modules.js', 'index.js']) {
    const filePath = path.join(generatedDir, fileName)
    const content = await fs.readFile(filePath, 'utf8')
    assert.ok(content.length > 0, `${fileName} should not be empty`)
  }
})

test('generated services registry uses escaped regex literals instead of broken placeholders', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'totistack-services-'))
  const generatedDir = path.join(tempRoot, 'src', 'generated')
  await fs.mkdir(generatedDir, { recursive: true })

  await generateAssemblyArtifacts(tempRoot)

  const servicesFile = await fs.readFile(path.join(generatedDir, 'services.js'), 'utf8')

  assert.ok(servicesFile.includes("replace(/^\\.\\.\\//, '')"))
  assert.ok(servicesFile.includes("replace(/^apps\\//, '')"))
  assert.ok(servicesFile.includes("replace(/^features\\//, '')"))
  assert.ok(servicesFile.includes("replace(/\\/(services)\\//, ':')"))
  assert.ok(servicesFile.includes("replace(/\\.js$/, '')"))
  assert.ok(servicesFile.includes("replace(/\\//g, '.')"))

  assert.equal(servicesFile.includes("replace(/^..//, '')"), false)
  assert.equal(servicesFile.includes("replace(//(services)//, ':')"), false)
  assert.equal(servicesFile.includes("replace(///g, '.')"), false)
})
