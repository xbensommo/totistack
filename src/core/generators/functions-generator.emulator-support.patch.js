/**
 * PATCH SNIPPET for src/core/generators/functions-generator.js
 *
 * Add this helper near the other generator helper functions, then call:
 *   await installFirebaseEmulatorSeedSupport(functionsDir)
 * after the Firebase Functions template has been installed and after package.json exists.
 *
 * If your generator variable is named projectPath instead of functionsDir, use:
 *   await installFirebaseEmulatorSeedSupport(path.join(projectPath, 'functions'))
 */

async function installFirebaseEmulatorSeedSupport(functionsDir) {
  const packageJsonPath = path.join(functionsDir, 'package.json')

  let pkg
  try {
    pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  } catch (error) {
    throw new InstallError(
      `Failed to read generated Firebase Functions package.json: ${error.message}`,
      { cause: error },
    )
  }

  pkg.version = '2.2.13'
  pkg.scripts = pkg.scripts || {}
  pkg.devDependencies = pkg.devDependencies || {}

  pkg.scripts['seed:sys-admin'] = pkg.scripts['seed:sys-admin'] || 'node scripts/seed-sys-admin.mjs'
  pkg.scripts['seed:sys-admin:emulator'] = [
    'cross-env',
    'TOTISTACK_USE_FIREBASE_EMULATOR=true',
    'FIREBASE_PROJECT_ID=totistack-emulator',
    'GOOGLE_CLOUD_PROJECT=totistack-emulator',
    'GCLOUD_PROJECT=totistack-emulator',
    'FIRESTORE_EMULATOR_HOST=127.0.0.1:8080',
    'FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099',
    'SYS_ADMIN_EMAIL=sysadmin@test.local',
    'SYS_ADMIN_PASSWORD=Password123!',
    'SYS_ADMIN_DISPLAY_NAME="System Administrator"',
    'node scripts/seed-sys-admin.mjs',
  ].join(' ')

  pkg.devDependencies['cross-env'] = pkg.devDependencies['cross-env'] || '^7.0.3'

  await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
}
