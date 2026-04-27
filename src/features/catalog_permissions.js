/**
 * @file permissions.js
 * @description Declarative permission registry for the catalog app.
 */

export default {
  module: 'catalog',
  permissions: [
    { key: 'catalog.products.read', resource: 'products', action: 'read', description: 'View products.' },
    { key: 'catalog.products.create', resource: 'products', action: 'create', description: 'Create products.' },
    { key: 'catalog.products.update', resource: 'products', action: 'update', description: 'Update products.' },
    { key: 'catalog.products.delete', resource: 'products', action: 'delete', description: 'Delete products.' },
    { key: 'catalog.products.publish', resource: 'products', action: 'publish', description: 'Publish products.' },
    { key: 'catalog.products.manage', resource: 'products', action: 'manage', description: 'Full control over products.' },

    { key: 'catalog.categories.read', resource: 'categories', action: 'read', description: 'View categories.' },
    { key: 'catalog.categories.create', resource: 'categories', action: 'create', description: 'Create categories.' },
    { key: 'catalog.categories.update', resource: 'categories', action: 'update', description: 'Update categories.' },
    { key: 'catalog.categories.delete', resource: 'categories', action: 'delete', description: 'Delete categories.' },
    { key: 'catalog.categories.manage', resource: 'categories', action: 'manage', description: 'Full control over categories.' },

    { key: 'catalog.inventory.read', resource: 'inventory', action: 'read', description: 'View inventory.' },
    { key: 'catalog.inventory.update', resource: 'inventory', action: 'update', description: 'Update inventory.' },
    { key: 'catalog.inventory.audit', resource: 'inventory', action: 'audit', description: 'Audit inventory records.' },
    { key: 'catalog.inventory.manage', resource: 'inventory', action: 'manage', description: 'Full control over inventory.' },
  ],
  roleTemplates: {
    admin: ['catalog.products.manage', 'catalog.categories.manage', 'catalog.inventory.manage'],
    receptionist: ['catalog.products.read', 'catalog.categories.read', 'catalog.inventory.read'],
    consultant: ['catalog.products.read', 'catalog.categories.read'],
    finance_officer: ['catalog.inventory.read', 'catalog.inventory.audit'],
    viewer: ['catalog.products.read', 'catalog.categories.read', 'catalog.inventory.read'],
  },
}