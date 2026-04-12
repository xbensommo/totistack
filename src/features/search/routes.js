/**
 * @file search/routes.js
 * @description Route records contributed by the search feature.
 */
export default [
  {
    path: '/admin/search',
    name: 'SearchAdmin',
    component: () => import('./pages/SearchAdminPage.vue'),
    meta: { requiresAuth: true, feature: 'search', permissions: ['search.manage'], title: 'Search Admin' },
  },
  {
    path: '/search',
    name: 'SearchExplorer',
    component: () => import('./pages/SearchExplorerPage.vue'),
    meta: { requiresAuth: false, feature: 'search', title: 'Search' },
  },
]
