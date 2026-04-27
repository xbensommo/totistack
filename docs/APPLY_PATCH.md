# Totistack v2.2.13 Emulator Seed Patch

## Files to replace

Replace this framework template file:

```txt
src/features/functions/src/firebase-admin.js
```

with:

```txt
framework_emulator_patch/src/features/functions/src/firebase-admin.js
```

This makes generated Firebase Functions projects support:

```txt
TOTISTACK_USE_FIREBASE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

## Generator patch

Open:

```txt
src/core/generators/functions-generator.js
```

Add the helper from:

```txt
src/core/generators/functions-generator.emulator-support.patch.js
```

Then call it after the Functions template has been copied and `functions/package.json` exists:

```js
await installFirebaseEmulatorSeedSupport(functionsDir)
```

If your generator only has `projectPath`, use:

```js
await installFirebaseEmulatorSeedSupport(path.join(projectPath, 'functions'))
```

## Generated project usage

Start emulator:

```bash
firebase emulators:start --only auth,firestore
```

Seed emulator:

```bash
cd functions
npm run seed:sys-admin:emulator
```
