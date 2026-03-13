## Example feature

## `src/features/auth/index.js`

```js
/**
 * @file index.js
 * @description Authentication feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the selected auth provider.
 *
 * @param {object} ctx - Installer context.
 * @returns {string} Provider name.
 */
function resolveAuthProvider(ctx) {
  return ctx.answers.authProvider || "firebase";
}

export default {
  name: "auth",
  type: "feature",
  title: "Authentication",
  description: "Adds auth scaffolding and provider-specific setup.",

  /**
   * Pre-installation hook.
   *
   * @param {object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  async beforeInstall(ctx) {
    ctx.logger.info?.("Preparing auth feature...");
    await ctx.ensureDir("src", "auth");
  },

  /**
   * Install auth files.
   *
   * @param {object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  async install(ctx) {
    const provider = resolveAuthProvider(ctx);

    await ctx.renderTemplate(
      path.join(__dirname, "templates", provider, "auth-service.js.hbs"),
      "src/auth/auth-service.js",
      {authProvider: provider}
    );

    await ctx.extendPackageJson({
      dependencies: provider === "firebase" ?
        {
          firebase: "^11.0.0",
        } :
        provider === "supabase" ?
          {
            "@supabase/supabase-js": "^2.0.0",
          } :
          {},
    });
  },

  /**
   * Post-installation hook.
   *
   * @param {object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  async afterInstall(ctx) {
    const provider = resolveAuthProvider(ctx);

    await ctx.appendEnv(".env.example", [
      `AUTH_PROVIDER=${provider}`,
    ]);

    const readmeSection = [
      "",
      "## Authentication",
      `Provider: ${provider}`,
      "",
    ].join("\n");

    if (await ctx.exists("README.md")) {
      await ctx.appendFile("README.md", readmeSection);
    } else {
      await ctx.writeFile(
        "README.md",
        `# ${ctx.projectName}\n${readmeSection}`
      );
    }
  },
};
```

---

## Example preset

## `src/presets/booking-platform.js`

```js
/**
 * @file booking-platform.js
 * @description Booking platform preset for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export default {
  name: "booking-platform",
  type: "preset",
  title: "Booking Platform",
  description: "Booking-focused platform with auth, dashboard, and notifications.",
  features: ["auth", "dashboard", "booking", "notifications"],
  options: {
    kind: "platform",
  },

  /**
   * Pre-installation hook.
   *
   * @param {object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  async beforeInstall(ctx) {
    ctx.logger.info?.("Initializing booking platform preset...");
    await ctx.ensureDir("src");
    await ctx.ensureDir("public");
  },

  /**
   * Install preset shell files.
   *
   * @param {object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  async install(ctx) {
    await ctx.writeJson("package.json", {
      name: ctx.projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
    });

    await ctx.writeFile(
      ".gitignore",
      [
        "node_modules",
        "dist",
        ".env",
        ".DS_Store",
        "",
      ].join("\n")
    );

    await ctx.writeFile(
      "README.md",
      [
        `# ${ctx.projectName}`,
        "",
        "Generated with Totistack.",
        "",
      ].join("\n")
    );
  },

  /**
   * Post-installation hook.
   *
   * @param {object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  async afterInstall(ctx) {
    await ctx.writeJson("totistack.json", {
      name: ctx.projectName,
      preset: ctx.preset?.name || null,
      features: ctx.features.map((feature) => feature.name),
      answers: ctx.answers,
      options: ctx.options,
    });
  },
};
```

---

## Suggested install flow call

Wherever your CLI currently finalizes project generation:

```js
import path from "node:path";
import {installProject} from "../core/install-project.js";

/**
 * Example command handler.
 *
 * @param {object} params - Command params.
 * @returns {Promise<void>}
 */
export async function handleCreateCommand(params) {
  const {
    projectName,
    preset,
    features,
    answers,
    options,
    logger = console,
  } = params;

  const targetDir = path.resolve(process.cwd(), projectName);

  await installProject({
    projectName,
    targetDir,
    preset,
    features,
    answers,
    options,
    logger,
  });

  logger.info?.(`Project created at ${targetDir}`);
}
```

---

## Recommended module contract from now on

Every feature/preset can safely support:

```js
export default {
  name: "example",
  type: "feature",
  title: "Example",
  description: "Example feature",
  prompts: [],
  async beforeInstall(ctx) {},
  async install(ctx) {},
  async afterInstall(ctx) {},
};
```

Or hook nesting if you want:

```js
export default {
  name: "example",
  type: "feature",
  hooks: {
    async beforeInstall(ctx) {},
    async afterInstall(ctx) {},
  },
  async install(ctx) {},
};
```

---

## Final install order

This is the actual execution order:

1. preset `beforeInstall`
2. each feature `beforeInstall`
3. preset `install`
4. each feature `install`
5. preset `afterInstall`
6. each feature `afterInstall`

That is the correct default for a project composer like Totistack.

---

## Next files to build after this

The best next step is:

* `src/core/prompt-engine.js`
* `src/core/module-resolver.js`
* `src/core/package-manager.js`

So Totistack can:

* resolve preset feature dependencies
* collect prompts from features automatically
* install dependencies with npm/pnpm/bun
* print next steps cleanly

I can give you that next in one full drop too.
do it and do not waste unneccesary lines of code, recall that the best code is the one do not have to write, and as always you know i love my criticism like oxygen so we can improve