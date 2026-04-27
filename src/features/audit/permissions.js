/** @file src/features/audit/permissions.js */

export const AUDIT_PERMISSIONS = Object.freeze({
  VIEW: 'audit.view',
  EXPORT: 'audit.export',
  MANAGE: 'audit.manage',
  REVIEW: 'audit.review',
})

export const AUDIT_ROLE_TEMPLATES = Object.freeze({
  auditor: [AUDIT_PERMISSIONS.VIEW, AUDIT_PERMISSIONS.EXPORT, AUDIT_PERMISSIONS.REVIEW],
  admin: [AUDIT_PERMISSIONS.VIEW, AUDIT_PERMISSIONS.REVIEW],
  'security-admin': Object.values(AUDIT_PERMISSIONS),
  sysadmin: Object.values(AUDIT_PERMISSIONS),
})

export default AUDIT_PERMISSIONS
