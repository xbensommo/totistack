# Auth feature

Firebase authentication and Totistack access-control feature.

## What changed

- Self-registration no longer trusts client-provided roles or permissions.
- Roles are treated as permission bundles.
- Route/action access is evaluated through `evaluateAccess()`.
- `deniedPermissionKeys` override all grants.
- `security-admin`, `auditor`, and `sysadmin` are separated from normal `admin`.
- Access reviews, security policies, session evidence, and user invites are first-class collections.

## Required route guard

Use `createAccessGuard()` as the global guard when assembling the router.

```js
import { createAccessGuard } from '@/features/auth'

router.beforeEach(createAccessGuard({
  getService: () => globalThis.__TOTISTACK_AUTH_SERVICE__,
  forbiddenRedirect: '/403',
}))
```

## Permission-first route example

```js
meta: {
  requiresAuth: true,
  permissions: ['auth.users.view'],
  requiresMfa: true,
}
```

## Self-registration rule

Do not pass `role`, `roles`, `permissions`, `permissionKeys`, `directPermissionKeys`, or `deniedPermissionKeys` from public registration forms. The service strips those fields by default.

## SOC 2 readiness

See:

- `SECURITY_ARCHITECTURE.md`
- `../audit/SOC2_CONTROL_MATRIX.md`
