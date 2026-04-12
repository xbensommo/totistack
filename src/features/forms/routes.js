/**
 * @file forms/routes.js
 * @description Route records contributed by the forms feature.
 */
export default [
  {
    path: '/admin/forms',
    name: 'FormsList',
    component: () => import('./pages/FormsListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'forms',
      permissions: ['forms.view'],
      title: 'Forms',
    },
  },
  {
    path: '/admin/forms/new',
    name: 'FormCreate',
    component: () => import('./pages/FormBuilderPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'forms',
      permissions: ['forms.manage'],
      title: 'Create Form',
    },
  },
  {
    path: '/admin/forms/:formId',
    name: 'FormEdit',
    component: () => import('./pages/FormBuilderPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'forms',
      permissions: ['forms.manage'],
      title: 'Edit Form',
    },
  },
  {
    path: '/admin/forms/:formId/submissions',
    name: 'FormSubmissions',
    component: () => import('./pages/FormSubmissionsPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'forms',
      permissions: ['forms.viewSubmissions'],
      title: 'Form Submissions',
    },
  },
  {
    path: '/forms/:slug',
    name: 'PublicForm',
    component: () => import('./pages/PublicFormPage.vue'),
    meta: {
      requiresAuth: false,
      feature: 'forms',
      title: 'Form',
    },
  },
]
