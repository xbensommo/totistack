/**
 * @file src/features/auth/routes.js
 * @description Declarative auth route contributions.
 */

export default [
  {
    path: '/auth',
    component: () => import('./pages/AuthLayout.vue'),
    meta: {
      guestOnly: true,
      title: 'Authentication',
    },
    children: [
      {
        path: '',
        name: 'auth.login',
        component: () => import('./pages/login.vue'),
        meta: {
          guestOnly: true,
          title: 'Sign in',
        },
      },
      {
        path: 'register',
        name: 'auth.register',
        component: () => import('./pages/register.vue'),
        meta: {
          guestOnly: true,
          title: 'Create account',
        },
      },
      {
        path: 'forgot-password',
        name: 'auth.forgot-password',
        component: () => import('./pages/forgot-password.vue'),
        meta: {
          guestOnly: true,
          title: 'Forgot password',
        },
      },
      {
        path: 'reset-password',
        name: 'auth.reset-password',
        component: () => import('./pages/reset-password.vue'),
        meta: {
          guestOnly: true,
          title: 'Reset password',
        },
      },
    ],
  },
  {
    path: '/account/profile',
    name: 'auth.profile',
    component: () => import('./pages/profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'My profile',
    },
  },
];
