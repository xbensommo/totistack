/**
 * @file routes.js
 * @description Route definitions for {{collectionName}} collection
 * @date 2026-03-22
 * @author Totistack Team
 */

export default [
  {
    path: '/{{routePath}}',
    name: '{{collectionName}}.list',
    component: () => import('./pages/{{componentName}}ListPage.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['read_{{collectionName}}'],
      title: '{{labelPlural}}'
    }
  },
  {
    path: '/{{routePath}}/create',
    name: '{{collectionName}}.create',
    component: () => import('./pages/{{componentName}}CreatePage.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['create_{{collectionName}}'],
      title: 'Create {{label}}'
    }
  },
  {
    path: '/{{routePath}}/:id',
    name: '{{collectionName}}.details',
    component: () => import('./pages/{{componentName}}DetailsPage.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['read_{{collectionName}}'],
      title: '{{label}} Details'
    }
  },
  {
    path: '/{{routePath}}/:id/edit',
    name: '{{collectionName}}.edit',
    component: () => import('./pages/{{componentName}}EditPage.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['edit_{{collectionName}}'],
      title: 'Edit {{label}}'
    }
  }
];