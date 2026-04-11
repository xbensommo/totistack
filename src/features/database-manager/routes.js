export default [
  {
    path: '/db-manager',
    name: 'dbmanager.collections',
    component: () => import('./pages/CollectionBrowser.vue'),
    meta: {
      requiresAuth: true,
      permissions: 'admin',
      title: 'DB Manager'
    }
  }
];
