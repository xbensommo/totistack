# Totistack strict tests

These tests are written for Node's built-in test runner so you do not need Jest or Vitest just to start.

## Run

```bash
node --test tests/**/*.test.js
```

## What this suite covers

- `features/shared/featureToolkit.js` utility behavior
- generated assembly artifact output
- config generation for auth/rbac flags
- dependency resolution behavior
- static contract checks for the shared toolkit scaffold gap
- static contract checks for the eager auth bootstrap in the router helper template

## Notes

Two analysis tests intentionally lock the **current** behavior so the suite stays green while you refactor:

- `tests/core/dependency-resolver.test.js`
- `tests/analysis/auth-router.contract.test.js`

After you patch those areas, flip those assertions to the desired behavior.
