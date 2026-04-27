# SOC 2 Control Matrix — Auth/Audit Feature

This matrix maps software controls to SOC 2-style control objectives. It is evidence support, not certification.

| Control Area | Software Commitment | Evidence Source |
|---|---|---|
| CC6.1 Logical access | Role/permission changes go through Cloud Functions only. | `auditLogs` actions: `auth.user.role_assigned`, `auth.user.permission_granted`, `auth.user.permission_denied` |
| CC6.1 Least privilege | Permissions resolve from roles + direct grants; explicit deny overrides all grants. | `users/{uid}`, Firebase custom claims, authz tests |
| CC6.2 New access | Public signup is policy-gated; invite-only signup requires hashed invite token. | `security_policies/auth.default`, `user_invites`, `auditLogs` |
| CC6.3 Access removal | Suspension disables Firebase Auth user and revokes refresh tokens. | `auth.user.suspended`, `auth.sessions.revoked` |
| CC6.6 Confidentiality of credentials | Passwords are handled by Firebase Auth; no passwords stored in Firestore. | Firebase Auth records, absence of password fields in definitions |
| CC6.8 Session control | Refresh tokens are revoked on suspension, role changes, grants, denials, and manual session revocation. | `sessions`, `users.sessionsRevokedAt`, audit evidence |
| CC7.2 Monitoring | Security-relevant events are structured with severity, actor, entity, control ID, and retention class. | `auditLogs` |
| CC8.1 Change management | Security policy changes are versioned in `security_policies`. | `security_policies`, `auditLogs` |

## Remaining operating controls

These are not solved by code alone:

- quarterly access reviews;
- approval records for privileged access;
- break-glass review after use;
- incident response drills;
- backup restore tests;
- production deployment approvals;
- employee onboarding/offboarding evidence.
