import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { generateConfig } from '../../src/core/generators/config-generator.js'

test('generateConfig enables auth and rbac only when selected features include them', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'totistack-config-'))

  await generateConfig(
    {
      name: 'demo-project',
      branding: { appName: 'Demo Project' },
      frontend: 'vue',
      packageManager: 'npm',
      apps: [],
      features: ['auth', 'rbac', 'search'],
      firestore: null,
    },
    tempRoot,
  )

  const accessConfig = await fs.readFile(path.join(tempRoot, 'src', 'config', 'access.config.js'), 'utf8')
  assert.match(accessConfig, /enabled:\s*true/)
  assert.match(accessConfig, /rbac:\s*\{[\s\S]*enabled:\s*true/)
})

test('generateConfig disables auth and rbac when they are not part of the selected feature set', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'totistack-config-'))

  await generateConfig(
    {
      name: 'demo-project',
      branding: { appName: 'Demo Project' },
      frontend: 'vue',
      packageManager: 'npm',
      apps: [],
      features: ['forms'],
      firestore: null,
    },
    tempRoot,
  )

  const accessConfig = await fs.readFile(path.join(tempRoot, 'src', 'config', 'access.config.js'), 'utf8')
  assert.match(accessConfig, /enabled:\s*false/)
  assert.match(accessConfig, /rbac:\s*\{[\s\S]*enabled:\s*false/)
})
