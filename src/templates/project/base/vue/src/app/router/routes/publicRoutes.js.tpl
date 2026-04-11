/** @file src/router/routes/publicRoutes.js */

/**
 * Public marketing routes.
 * @param {(view: string, dir?: string) => () => Promise<any>} lazy
 * @returns {import('vue-router').RouteRecordRaw}
 */
export const publicRoutes = (lazy) => ({
  path: '/',
  component: lazy('PublicLayout', 'public'),
  meta: {
    title: 'Default Title | App Name',
    requiresAuth: false,
  },
  children: [
    {
      path: '',
      name: 'PublicPage',
      component: lazy('LandingPage', 'public'),
      meta: {
        title: 'Default Title | App Name',
      },
    },
    {
      path: 'about-us',
      name: 'AboutPage',
      component: lazy('About', 'public'),
      meta: {
        title: 'Default Title | App Name',
      },
    },
    {
      path: 'faq',
      name: 'Faq',
      component: lazy('FAQ', 'public'),
      meta: {
        title: 'Default Title | App Name',
      },
    },
    {
      path: 'terms',
      name: 'Terms',
      component: lazy('TermsPrivacy', 'public'),
      meta: {
        title: 'Default Title | App Name',
      },
    },
  ],
})
