/**
 * @file permissions.js
 * @description Declarative permission registry for the files feature.
 */

export default {
  module: 'files',
  permissions: [
    { key: 'files.files.read', resource: 'files', action: 'read', description: 'View files.' },
    { key: 'files.files.upload', resource: 'files', action: 'upload', description: 'Upload files.' },
    { key: 'files.files.update', resource: 'files', action: 'update', description: 'Update file metadata.' },
    { key: 'files.files.delete', resource: 'files', action: 'delete', description: 'Delete files.' },
    { key: 'files.files.download', resource: 'files', action: 'download', description: 'Download files.' },
    { key: 'files.files.manage', resource: 'files', action: 'manage', description: 'Full control over files.' },

    { key: 'files.library.read', resource: 'library', action: 'read', description: 'View file library.' },
    { key: 'files.library.configure', resource: 'library', action: 'configure', description: 'Configure file library settings.' },
    { key: 'files.library.manage', resource: 'library', action: 'manage', description: 'Full control over file library.' },
  ],
  roleTemplates: {
    admin: ['files.files.manage', 'files.library.manage'],
    receptionist: ['files.files.read', 'files.files.upload', 'files.files.download'],
    consultant: ['files.files.read', 'files.files.upload', 'files.files.download'],
    finance_officer: ['files.files.read', 'files.files.download'],
    viewer: ['files.files.read', 'files.files.download'],
  },
}