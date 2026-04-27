# Totistack Auth Security Architecture

## Position

This feature is now an authentication and authorization foundation, not a basic login package.

Firebase Auth is the identity provider. Firestore `users`, `roles`, `sessions`, `user_invites`, `access_reviews`, and `security_policies` hold authorization, security policy, and evidence metadata.

## Non-negotiable commitments

1. **No browser privilege elevation**
   - Self-registration must not accept `role`, `roles`, `permissions`, `permissionKeys`, `directPermissionKeys`, or `deniedPermissionKeys` from client payloads.
   - Default self-signup role is `user` unless a trusted server-side invite flow assigns a different role.

2. **Permissions before roles**
   - Roles are bundles.
   - Guards and actions check permission keys.
   - `admin` is not a magical bypass.
   - `sysadmin` is the only break-glass bypass and should be restricted to founders/platform operators.

3. **Explicit deny wins**
   - `deniedPermissionKeys` override role permissions and direct permissions.
   - This supports separation-of-duties and emergency restriction without role redesign.

4. **Privileged access is auditable**
   - Role changes, suspensions, session revocations, security policy updates, and access reviews must write audit evidence.
   - Client-side audit writes are acceptable only for low-trust UI telemetry. Authoritative audit evidence must be server-written.

5. **Access is time-bound and reviewed**
   - `access_reviews` provides evidence for periodic access review.
   - `lastAccessReviewAt` and `accessReviewedBy` exist on user profiles.

6. **Session evidence is metadata only**
   - Store hashes for IP/device/user-agent evidence where required.
   - Do not store raw secrets, raw reset tokens, full IP addresses, or unnecessary personal data.

7. **MFA is policy-driven**
   - `security_policies.mfaRequiredForRoles` and user-level `mfaRequired` define enforcement hooks.
   - Route/action metadata supports `requiresMfa`.

## Access-control flow

```txt
Firebase Auth user
  -> users/{uid} access profile
  -> buildAccessContext()
  -> route/action evaluateAccess()
  -> allow/deny decision
  -> audit evidence for sensitive decisions
```

## Route meta contract

```js
meta: {
  requiresAuth: true,
  permissions: ['auth.users.view'],
  roles: ['auditor'],          // optional, use sparingly
  requiresMfa: true,           // for privileged pages
  requiresVerifiedEmail: true, // for sensitive workflows
}
```

Prefer `permissions` over `roles`. Use `roles` only for coarse product segmentation.

## Role model

| Role | Purpose | Notes |
|---|---|---|
| `user` | Basic authenticated user | Own profile only |
| `consultant` | Staff contributor | No user administration by default |
| `receptionist` | Front-desk operator | Can view users, not change roles |
| `support` | Support/debug role | Read sessions/audit, no privileged writes |
| `manager` | Operational manager | Can invite/update normal users |
| `auditor` | Read-only evidence role | Audit/access-review read/export |
| `admin` | Business administrator | User admin, not full security policy ownership |
| `security-admin` | Security administrator | Security policy, access reviews, audit export |
| `sysadmin` | Break-glass | Full platform authority; restrict heavily |

## Required server-side enforcement

Firestore rules and Cloud Functions must enforce:

- users can read/update only allowed own profile fields;
- role/permission fields can only be changed by trusted admin/server flows;
- audit logs are append-only and server-written;
- reset token documents store only token hashes;
- deletes of audit/security evidence are blocked except through retention-controlled server jobs.

## What this still does not give you

This code does not make the business SOC 2 certified. SOC 2 requires policies, evidence, operating discipline, and an independent audit. This code gives the software architecture needed to support those controls.

## Server-action upgrade

This package now treats Cloud Functions as the trusted authority for privileged access changes.

### Added controls

- `completeSignup` enforces the active signup policy before creating an authorization profile.
- `createUserByInvite` supports invite-only systems without allowing browser-written access profiles.
- `assignUserRole`, `grantUserPermission`, and `denyUserPermission` update Firestore and Firebase custom claims together.
- `suspendUser` disables Firebase Auth user access and revokes refresh tokens.
- `revokeUserSessions` invalidates Firebase refresh tokens and marks session evidence revoked.
- `syncUserClaims` and `syncCurrentUserClaims` rebuild compact custom claims from the server-side profile.
- `recordAuditEvent` writes server-owned evidence only.

### Bootstrap model

The first `sysadmin` must be seeded with `functions/scripts/seed-sys-admin.mjs`. This is intentional. No public route, invite, or client form should ever create a `sysadmin`.

### Default posture

- Invite-only signup by default.
- Public signup must be explicitly enabled in `security_policies/auth.default`.
- Client-side role/security writes are disabled by default.
- Legacy client writes require explicit `allowClientProfileWrites: true` and should be used only during migration.
