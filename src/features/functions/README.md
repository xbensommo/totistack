# Totistack Auth/Audit Cloud Functions

Trusted backend control plane for the Totistack auth and audit features.

## Functions

| Function | Purpose |
|---|---|
| `completeSignup` | Creates authorization profile/custom claims for public signup or accepted invite. |
| `createUserByInvite` | Creates Firebase Auth user from invite token and password. |
| `createInvite` | Creates hashed invitation token and invite evidence. |
| `assignUserRole` | Changes user role, syncs custom claims, revokes refresh tokens. |
| `grantUserPermission` | Adds direct permissions, syncs custom claims, revokes refresh tokens. |
| `denyUserPermission` | Adds explicit denied permissions, syncs custom claims, revokes refresh tokens. |
| `suspendUser` | Suspends profile, disables Firebase Auth user, revokes refresh tokens. |
| `restoreUser` | Restores suspended user and syncs claims. |
| `revokeUserSessions` | Revokes Firebase refresh tokens and marks session evidence revoked. |
| `syncUserClaims` | Rebuilds claims for a target user. |
| `syncCurrentUserClaims` | Allows the current user to refresh backend claim state. |
| `recordAuditEvent` | Server-written audit evidence for approved security integrations. |

## Install

```bash
cd functions
npm install
```

## Deploy

```bash
npm run deploy
```

## Bootstrap first sysadmin

```bash
SYS_ADMIN_EMAIL="owner@example.com" \
SYS_ADMIN_PASSWORD="replace-with-strong-password" \
SYS_ADMIN_DISPLAY_NAME="System Administrator" \
npm run seed:sys-admin
```

Never commit passwords or service-account files.

## Environment flags

| Variable | Default | Meaning |
|---|---:|---|
| `FUNCTIONS_REGION` | `us-central1` | Region for callable functions. |
| `ENFORCE_APP_CHECK` | `false` | Enables callable App Check enforcement. |
| `ENFORCE_PRIVILEGED_MFA` | `false` | Requires Firebase MFA second factor for privileged functions. Enable after MFA UX exists. |
| `AUTH_INVITE_ONLY` | `true` | Seeded policy starts invite-only. |
| `AUTH_ALLOW_PUBLIC_SIGNUP` | `false` | Seeded policy allows public signup. |
| `AUTH_ALLOWED_EMAIL_DOMAINS` | empty | Optional comma-separated domain allowlist. |

## Required app posture

- Firestore rules must block client writes to security fields.
- Client must use `createAuthServerActions()` for privileged actions.
- First sysadmin must come from the seed script only.
