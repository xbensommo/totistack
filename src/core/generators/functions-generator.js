/**
 * @file functions-generator.js
 * @description Generates Firebase Functions support for server-actions, notifications, and audit.
 *
 * Ordinary CRUD stays on the frontend/root store. This generator only builds
 * backend functions when selected modules declare server-side work.
 */

import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath, pathToFileURL } from 'url'
import { spawnSync } from 'node:child_process'
import { installTemplate, installTemplateFile } from '../installer/template-installer.js'
import { logger } from '../utils/logger.js'
import { InstallError } from '../errors/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FRAMEWORK_SRC_DIR = path.resolve(__dirname, '..', '..')
const AUTH_CONTROL_PLANE_SOURCE_DIR = path.join(FRAMEWORK_SRC_DIR, 'features', 'functions', 'src')
const AUTH_CONTROL_PLANE_SCRIPT_DIR = path.join(FRAMEWORK_SRC_DIR, 'features', 'functions', 'scripts')

const SERVER_FEATURE_IDS = new Set(['auth', 'server-actions', 'notifications', 'audit'])

const SERVER_ACTION_CANDIDATES = [
  'functions/server-actions.js',
  'functions/server-actions/index.js',
  'functions/server.actions.js',
  'server-actions.js',
  'server.actions.js',
]

const NOTIFICATION_CANDIDATES = [
  'functions/notifications.js',
  'functions/notifications/index.js',
  'functions/notification-events.js',
  'notifications.js',
  'notification-events.js',
]

const FIRESTORE_TRIGGER_CANDIDATES = [
  'functions/firestore-triggers.js',
  'functions/firestore-triggers/index.js',
  'functions/triggers.js',
  'functions/triggers/index.js',
]

function needsFunctions(config = {}) {
  const features = new Set(Array.isArray(config.features) ? config.features : [])
  return [...SERVER_FEATURE_IDS].some((featureId) => features.has(featureId))
}

function safeIdentifier(value) {
  return String(value || 'module')
    .replace(/[^a-zA-Z0-9_$]+/g, '_')
    .replace(/^([0-9])/, '_$1')
}

function exportName(value, fallback = 'generatedFunction') {
  const cleaned = String(value || fallback)
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match, char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9_$]/g, '')

  const normalized = cleaned || fallback
  return /^[0-9]/.test(normalized) ? `fn${normalized}` : normalized
}

function normalizeCollection(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') return Object.values(value).filter(Boolean)
  return [value]
}

async function findExistingCandidate(moduleDir, candidates) {
  for (const candidate of candidates) {
    const fullPath = path.join(moduleDir, candidate)
    if (await fs.pathExists(fullPath)) return fullPath
  }

  return null
}

async function discoverBackendModules(projectPath, candidates, generatedSubdir, suffix) {
  const discovered = []
  const moduleRoots = [
    { kind: 'app', dir: path.join(projectPath, 'src', 'apps') },
    { kind: 'feature', dir: path.join(projectPath, 'src', 'features') },
  ]

  for (const root of moduleRoots) {
    if (!(await fs.pathExists(root.dir))) continue

    const entries = await fs.readdir(root.dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const moduleId = entry.name
      const moduleDir = path.join(root.dir, moduleId)
      const candidatePath = await findExistingCandidate(moduleDir, candidates)
      if (!candidatePath) continue

      const fileName = `${root.kind}-${moduleId}.${suffix}.js`
      const generatedPath = path.join(projectPath, 'functions', 'src', 'generated', generatedSubdir, fileName)
      await fs.ensureDir(path.dirname(generatedPath))
      await fs.copy(candidatePath, generatedPath)

      discovered.push({
        kind: root.kind,
        moduleId,
        sourcePath: candidatePath,
        generatedPath,
        importPath: `./${generatedSubdir}/${fileName}`,
        importName: safeIdentifier(`${root.kind}_${moduleId}_${suffix}`),
      })
    }
  }

  return discovered.sort((a, b) => `${a.kind}:${a.moduleId}`.localeCompare(`${b.kind}:${b.moduleId}`))
}

async function importGeneratedModule(filePath) {
  const url = `${pathToFileURL(filePath).href}?t=${Date.now()}`
  return import(url)
}

function extractFirestoreTriggers(mod) {
  return [mod?.firestoreTriggers, mod?.triggers, mod?.default]
    .flatMap(normalizeCollection)
    .filter((item) => item && typeof item === 'object')
}

async function buildServerActionRegistry(projectPath, modules) {
  const imports = []
  const spreads = []

  for (const module of modules) {
    imports.push(`import * as ${module.importName} from '${module.importPath}'`)
    spreads.push(`  ...extractServerActions(${module.importName}, '${module.kind}:${module.moduleId}'),`)
  }

  const content = `/**
 * @file functions/src/generated/server-actions.registry.js
 * @description Generated server-action registry. Do not edit manually.
 */

${imports.join('\n')}

function normalizeList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') return Object.values(value).filter(Boolean)
  return []
}

function extractServerActions(mod, moduleName) {
  const definitions = [
    ...normalizeList(mod.serverActions),
    ...normalizeList(mod.serverActionDefinitions),
    ...normalizeList(mod.default),
  ].filter((definition) => definition && typeof definition === 'object')

  return definitions.map((definition) => ({ ...definition, module: definition.module || moduleName }))
}

function createServerActionRegistry(definitions) {
  const registry = {}

  for (const definition of definitions) {
    if (!definition.id || typeof definition.id !== 'string') {
      throw new Error('[functions/generated/server-actions] Server action is missing string id.')
    }

    if (!definition.permission || typeof definition.permission !== 'string') {
      throw new Error('[functions/generated/server-actions] Server action "' + definition.id + '" is missing permission.')
    }

    if (typeof definition.handler !== 'function') {
      throw new Error('[functions/generated/server-actions] Server action "' + definition.id + '" is missing handler(ctx).')
    }

    if (registry[definition.id]) {
      throw new Error('[functions/generated/server-actions] Duplicate server action id: ' + definition.id)
    }

    registry[definition.id] = Object.freeze(definition)
  }

  return Object.freeze(registry)
}

export const serverActionRegistry = createServerActionRegistry([
${spreads.join('\n')}
])

export default serverActionRegistry
`

  await fs.writeFile(path.join(projectPath, 'functions', 'src', 'generated', 'server-actions.registry.js'), content)
}

async function buildNotificationRegistry(projectPath, modules) {
  const imports = []
  const spreads = []

  for (const module of modules) {
    imports.push(`import * as ${module.importName} from '${module.importPath}'`)
    spreads.push(`  ...extractNotifications(${module.importName}, '${module.kind}:${module.moduleId}'),`)
  }

  const content = `/**
 * @file functions/src/generated/notifications.registry.js
 * @description Generated notification definition registry. Do not edit manually.
 */

${imports.join('\n')}

function normalizeList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') return Object.values(value).filter(Boolean)
  return []
}

function extractNotifications(mod, moduleName) {
  const definitions = [
    ...normalizeList(mod.notificationDefinitions),
    ...normalizeList(mod.notifications),
    ...normalizeList(mod.notificationEvents),
    ...normalizeList(mod.default),
  ].filter((definition) => definition && typeof definition === 'object')

  return definitions.map((definition) => ({ ...definition, module: definition.module || moduleName }))
}

function createNotificationRegistry(definitions) {
  const registry = {}

  for (const definition of definitions) {
    if (!definition.type || typeof definition.type !== 'string') {
      throw new Error('[functions/generated/notifications] Notification definition is missing string type.')
    }

    if (registry[definition.type]) {
      throw new Error('[functions/generated/notifications] Duplicate notification type: ' + definition.type)
    }

    registry[definition.type] = Object.freeze(definition)
  }

  return Object.freeze(registry)
}

export const notificationRegistry = createNotificationRegistry([
${spreads.join('\n')}
])

export default notificationRegistry
`

  await fs.writeFile(path.join(projectPath, 'functions', 'src', 'generated', 'notifications.registry.js'), content)
}

function validateFirestoreTrigger(trigger, moduleName) {
  if (!trigger.name || typeof trigger.name !== 'string') {
    throw new Error(`[functions/generated] Firestore trigger in ${moduleName} is missing string name.`)
  }

  if (!trigger.document || typeof trigger.document !== 'string') {
    throw new Error(`[functions/generated] Firestore trigger ${trigger.name} is missing document path.`)
  }

  if (!['created', 'updated', 'written', 'deleted'].includes(trigger.event)) {
    throw new Error(`[functions/generated] Firestore trigger ${trigger.name} has invalid event: ${trigger.event}`)
  }

  if (typeof trigger.handler !== 'function') {
    throw new Error(`[functions/generated] Firestore trigger ${trigger.name} is missing handler(event).`)
  }
}

async function buildGeneratedFunctionExports(projectPath, modules) {
  const discoveredTriggers = []

  for (const module of modules) {
    const imported = await importGeneratedModule(module.generatedPath)
    for (const trigger of extractFirestoreTriggers(imported)) {
      validateFirestoreTrigger(trigger, `${module.kind}:${module.moduleId}`)
      discoveredTriggers.push({ module, trigger })
    }
  }

  const imports = [
    "import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated, onDocumentWritten } from 'firebase-functions/v2/firestore'",
    "import { FUNCTION_RUNTIME } from '../runtime/options.js'",
  ]

  const helpers = `
function normalizeList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') return Object.values(value).filter(Boolean)
  return []
}

function getFirestoreTrigger(mod, name) {
  const definitions = [
    ...normalizeList(mod.firestoreTriggers),
    ...normalizeList(mod.triggers),
    ...normalizeList(mod.default),
  ]

  const match = definitions.find((definition) => definition?.name === name)
  if (!match) throw new Error('[functions/generated] Missing Firestore trigger: ' + name)
  return match
}
`

  const exports = []

  discoveredTriggers.forEach((entry, index) => {
    const importName = `triggerModule${index}`
    const triggerConst = `triggerDefinition${index}`
    const functionName = exportName(entry.trigger.exportName || entry.trigger.name)
    const factoryName = {
      created: 'onDocumentCreated',
      updated: 'onDocumentUpdated',
      written: 'onDocumentWritten',
      deleted: 'onDocumentDeleted',
    }[entry.trigger.event]

    imports.push(`import * as ${importName} from '${entry.module.importPath}'`)
    exports.push(`const ${triggerConst} = getFirestoreTrigger(${importName}, ${JSON.stringify(entry.trigger.name)})\n\nexport const ${functionName} = ${factoryName}(\n  {\n    ...FUNCTION_RUNTIME.event,\n    ...(${triggerConst}.options || {}),\n    document: ${JSON.stringify(entry.trigger.document)},\n  },\n  (event) => ${triggerConst}.handler(event),\n)`)
  })

  const content = `/**
 * @file functions/src/generated/functions.generated.js
 * @description Generated Firebase Function exports. Do not edit manually.
 */

${imports.join('\n')}
${helpers}
${exports.length ? exports.join('\n\n') : 'export {}'}
`

  await fs.writeFile(path.join(projectPath, 'functions', 'src', 'generated', 'functions.generated.js'), content)
}

async function validateGeneratedRegistries(projectPath) {
  const files = [
    'functions/src/index.js',
    'functions/src/generated/server-actions.registry.js',
    'functions/src/generated/notifications.registry.js',
    'functions/src/generated/functions.generated.js',
  ]

  for (const file of files) {
    const fullPath = path.join(projectPath, file)
    if (!(await fs.pathExists(fullPath))) continue
    const result = spawnSync('node', ['--check', fullPath], { encoding: 'utf8' })
    if (result.status !== 0) {
      throw new Error(`Generated functions syntax check failed for ${file}: ${result.stderr}`)
    }
  }
}

/**
 * Generate the Firebase Functions backend for selected Totistack server features.
 *
 * @param {object} config
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
export async function generateFunctionsArtifacts(config, projectPath) {
  if (!needsFunctions(config)) {
    logger.debug('No server functions features selected; skipping functions generation')
    return
  }

  try {
    await installTemplate(path.join('functions', 'firebase'), path.join(projectPath, 'functions'), {
      projectName: config.name,
    })

    if (Array.isArray(config.features) && config.features.includes('notifications')) {
      await installTemplateFile(
        path.join('public', 'firebase-messaging-sw.js.tpl'),
        path.join(projectPath, 'public', 'firebase-messaging-sw.js'),
        { projectName: config.name },
      )
    }

    await installAuthControlPlane(projectPath, config)

    const serverActionModules = await discoverBackendModules(
      projectPath,
      SERVER_ACTION_CANDIDATES,
      'server-actions',
      'server-actions',
    )

    const notificationModules = await discoverBackendModules(
      projectPath,
      NOTIFICATION_CANDIDATES,
      'notifications',
      'notifications',
    )

    const firestoreTriggerModules = await discoverBackendModules(
      projectPath,
      FIRESTORE_TRIGGER_CANDIDATES,
      'firestore-triggers',
      'firestore-triggers',
    )

    await buildServerActionRegistry(projectPath, serverActionModules)
    await buildNotificationRegistry(projectPath, notificationModules)
    await buildGeneratedFunctionExports(projectPath, firestoreTriggerModules)
    await validateGeneratedRegistries(projectPath)

    logger.info(
      `Generated Firebase Functions backend (${serverActionModules.length} server-action module(s), ` +
        `${notificationModules.length} notification module(s), ${firestoreTriggerModules.length} trigger module(s))`,
    )
  } catch (error) {
    throw new InstallError(`Failed to generate Firebase Functions artifacts: ${error.message}`, { cause: error })
  }
}
