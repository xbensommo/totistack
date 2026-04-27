# Auth Security Control Plane

This auth/audit package now separates **UI access checks** from **trusted authority**.

## Final authority

| Concern | Owner |
|---|---|
| Login session | Firebase Auth |
| Authorization profile | `users/{uid}` |
| Runtime route/menu visibility | client access guards |
| Role / permission / suspension changes | Cloud Functions server actions |
| Firestore data protection | Firestore Security Rules + custom claims |
| Audit evidence | Cloud Functions / Admin SDK only |
| Bootstrap account | one-time Admin SDK seed script |

## Non-negotiable architectural commitments

1. Browser code never writes role, permission, status, MFA, session revocation, or audit evidence fields.
2. All privileged access changes go through callable Cloud Functions.
3. Cloud Functions update Firestore and Firebase custom claims in one logical operation.
4. Custom claims are refreshed after access changes; refresh tokens are revoked for privileged changes.
5. Signup behavior is driven by `security_policies/auth.default`.
6. Invite-only systems must use `createUserByInvite`.
7. Public-signup systems must call `completeSignup` after Firebase Auth account creation.
8. The first `sysadmin` is created only by `functions/scripts/seed-sys-admin.mjs`.
9. Audit evidence is server-written and append-oriented.
10. Explicit denied permissions override role and direct grants.

## Signup modes

### Invite-only

Use this when the system is internal, staff-only, or enterprise-controlled.

```js
createAuthAccessService({
  auth,
  state,
  collectionActions,
  storeApi,
  serverActions,
  config: {
    signupMode: 'invite-only',
  },
})
```

Flow:

1. `sysadmin` or permitted admin calls `serverActions.createInvite()`.
2. User receives invite token.
3. Register page calls `authService.signUp(email, password, { inviteToken })`.
4. Auth service calls Cloud Function `createUserByInvite`.
5. Cloud Function validates invite, creates Firebase Auth user, creates profile, sets custom claims, writes audit evidence.
6. Client signs in and refreshes token.

### Public signup

Use this only when the product intentionally allows public users.

```js
createAuthAccessService({
  auth,
  state,
  collectionActions,
  storeApi,
  serverActions,
  config: {
    signupMode: 'public',
  },
})
```

Flow:

1. Browser creates Firebase Auth account.
2. Browser calls Cloud Function `completeSignup`.
3. Cloud Function checks `security_policies/auth.default.allowPublicSignup === true`.
4. Cloud Function creates authorization profile and custom claims.
5. Client refreshes ID token.

### Disabled signup

Use this for environments where only administrators create users.

```js
config: {
  signupMode: 'disabled',
}
```

## Server actions usage

```js
import { getFunctions } from 'firebase/functions'
import { createAuthServerActions } from '@/features/auth'

const serverActions = createAuthServerActions({
  functions: getFunctions(app, 'us-central1'),
})

await serverActions.assignUserRole(uid, 'manager', {
  reason: 'Approved access change request.',
})

await serverActions.denyUserPermission(uid, ['audit.export'], {
  reason: 'Auditor may view evidence but not export it.',
})

await serverActions.revokeUserSessions(uid, 'Suspicious session activity.')
```

## Bootstrap sysadmin

Do not seed a sysadmin in frontend code.

```bash
cd functions
npm install

SYS_ADMIN_EMAIL="owner@example.com" \
SYS_ADMIN_PASSWORD="replace-with-a-strong-temporary-password" \
SYS_ADMIN_DISPLAY_NAME="System Administrator" \
npm run seed:sys-admin
```

After bootstrap:

1. Sign in as the sysadmin.
2. Enroll MFA.
3. Create a second `security-admin` user.
4. Stop using the bootstrap sysadmin for daily work.
5. Keep sysadmin as break-glass only.

## Required deployment

```bash
cd functions
npm install
npm run deploy

firebase deploy --only firestore:rules,firestore:indexes
```

## Required client wiring

Inject `serverActions` into `createAuthAccessService`. If you do not inject it, privileged operations intentionally fail unless `allowClientProfileWrites: true` is explicitly set for legacy migration.

```js
createAuthAccessService({
  auth,
  state,
  collectionActions,
  storeApi,
  serverActions,
  config: {
    signupMode: 'invite-only',
    allowClientProfileWrites: false,
  },
})
```

## Firebase custom claims

The Cloud Functions write claims containing:

```js
{
  roles: ['manager'],
  permissions: ['auth.users.view'],
  deniedPermissionKeys: [],
  accessVersion: 1710000000000,
  status: 'active',
  mfaRequired: false,
  mfaEnrolled: false,
  authzVersion: 1,
}
```

Claims are intentionally compact because Firebase custom claims have a size limit. Do not place user profile data, display names, departments, or audit metadata inside claims.

## What remains outside code

This is SOC 2-aligned architecture, not a SOC 2 certification. You still need operating evidence:

- access review calendar;
- privileged access approval procedure;
- incident response procedure;
- vendor and infrastructure risk review;
- backup/restore evidence;
- employee onboarding/offboarding evidence;
- periodic audit-log review.
