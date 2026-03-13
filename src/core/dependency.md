# 4) Feature examples

## `src/features/database/index.js`

```js
/**
 * @file index.js
 * @description Database feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export default {
  name: "database",
  type: "feature",
  title: "Database",
  description: "Adds database configuration and environment setup.",

  async install(ctx) {
    await ctx.appendEnv(".env.example", [
      "DATABASE_URL=",
    ]);

    await ctx.extendPackageJson({
      dependencies: {
        pg: "^8.13.0",
      },
    });
  },
};
```

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
 * Resolve selected auth provider.
 *
 * @param {object} ctx - Installer context.
 * @returns {string} Provider name.
 */
function getProvider(ctx) {
  return ctx.answers.authProvider || "firebase";
}

export default {
  name: "auth",
  type: "feature",
  title: "Authentication",
  description: "Adds authentication scaffolding.",

  prompts: [
    {
      type: "list",
      name: "authProvider",
      message: "Choose auth provider",
      choices: ["firebase", "supabase", "custom"],
      default: "firebase",
    },
  ],

  async install(ctx) {
    const provider = getProvider(ctx);

    await ctx.ensureDir("src", "auth");

    await ctx.renderTemplate(
      path.join(__dirname, "templates", provider, "auth-service.js.hbs"),
      "src/auth/auth-service.js",
      {authProvider: provider}
    );

    await ctx.extendPackageJson({
      dependencies:
        provider === "firebase" ?
          {firebase: "^11.0.0"} :
          provider === "supabase" ?
            {"@supabase/supabase-js": "^2.0.0"} :
            {},
    });
  },
};
```

## `src/features/booking/index.js`

```js
/**
 * @file index.js
 * @description Booking feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export default {
  name: "booking",
  type: "feature",
  title: "Booking",
  description: "Adds booking flows and booking data structures.",
  requires: ["auth", "database"],

  prompts: [
    {
      type: "list",
      name: "bookingAccess",
      message: "Should booking be public or private?",
      choices: ["public", "private"],
      default: "public",
    },
  ],

  async install(ctx) {
    await ctx.ensureDir("src", "booking");

    await ctx.writeFile(
      "src/booking/index.js",
      [
        "/**",
        " * Booking module entry.",
        " */",
        `export const bookingAccess = "${ctx.answers.bookingAccess || "public"}";`,
        "",
      ].join("\n")
    );
  },
};
```

## `src/features/payments/index.js`

```js
/**
 * @file index.js
 * @description Payments feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export default {
  name: "payments",
  type: "feature",
  title: "Payments",
  description: "Adds payment processing scaffolding.",
  requires: ["auth"],

  async install(ctx) {
    await ctx.ensureDir("src", "payments");
    await ctx.writeFile(
      "src/payments/index.js",
      "export const paymentsEnabled = true;\n"
    );
  },
};
```

## `src/features/crm/index.js`

```js
/**
 * @file index.js
 * @description CRM feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

export default {
  name: "crm",
  type: "feature",
  title: "CRM",
  description: "Adds CRM foundation.",
  requires: ["database", "dashboard"],

  async install(ctx) {
    await ctx.ensureDir("src", "crm");
    await ctx.writeFile(
      "src/crm/index.js",
      "export const crmEnabled = true;\n"
    );
  },
};
```

---

# 5) Example preset

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
  description: "Booking-focused platform with auth and dashboard.",
  features: ["booking", "dashboard", "notifications"],
  options: {
    kind: "platform",
  },

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
  },

  async afterInstall(ctx) {
    await ctx.writeJson("totistack.json", {
      name: ctx.projectName,
      preset: ctx.preset?.name || null,
      features: ctx.features.map((feature) => feature.name),
    });
  },
};
```

Because `booking` requires `auth` and `database`, those get pulled automatically.

---

# 6) CLI usage pattern

Your create command should now call installer like this:

```js
import path from "node:path";
import {installProject} from "../core/install-project.js";

/**
 * Handle the create command.
 *
 * @param {object} params - Command params.
 * @returns {Promise<void>}
 */
export async function handleCreateCommand({
  projectName,
  preset,
  requestedFeatures,
  registryFeatures,
  answers,
  options,
  logger = console,
}) {
  await installProject({
    projectName,
    targetDir: path.resolve(process.cwd(), projectName),
    preset,
    requestedFeatures,
    registryFeatures,
    answers,
    options,
    logger,
  });
}
```

---

# 7) What this gets right

This solves the real problem:

* users should not need to know every internal dependency
* presets stay small
* features declare their own requirements
* install order becomes correct automatically

Example:

```js
crm -> database, dashboard
booking -> auth, database
payments -> auth
```

Requesting:

```txt
crm, payments
```

resolves to:

```txt
database
dashboard
crm
auth
payments
```

Or similar dependency-safe order depending on root traversal.

That is enough.

---

# 8) Brutal criticism

Here is where Totistack can still go wrong.

## Good

This dependency system is the right size.

It is:

* readable
* recursive
* deterministic enough
* hard to break

## Bad

The circular dependency error is still ugly:

```txt
Circular feature dependency detected: auth
```

That works, but not beautifully. A more helpful message would show the chain:

```txt
booking -> auth -> booking
```

You do not need that yet.

## Risk

You are still relying on feature names as raw strings everywhere.

That is acceptable for now, but it means:

* typos are fatal
* refactors must be careful
* no aliasing exists

Still better than inventing IDs and registries on day one.

## Bigger risk

Your prompt engine currently merges every prompt from every resolved feature.

That means if `booking` pulls in `auth`, users may be asked auth questions they did not expect.

That is not wrong, but it affects UX.

You will eventually want conditional prompts like:

```js
when: (answers, ctx) => ctx.requestedFeatures.includes("auth")
```

But not today.

## Biggest current weakness

`installDependencies()` always runs.

That is not always desirable.

You should soon support:

* `--no-install`
* `options.install !== false`

That is more important than smarter dependency graphs.

---

# 9) The next correct improvement

The next addition should be tiny and valuable:

* support `optional` dependencies
* support `peer` warnings
* support `--no-install`

Not now:

* version constraints between features
* plugin marketplaces
* hook priorities
* dependency metadata objects

Those are how clean tools become garbage.

---

# 10) Minimal future extension

When ready, feature shape can grow to this:

```js
export default {
  name: "booking",
  requires: ["auth", "database"],
  optional: ["notifications"],
  prompts: [],
  async install(ctx) {},
}
```

That is the furthest I would go before real demand appears.

The next best move is adding `--no-install` and making the create command print a clean final summary.
