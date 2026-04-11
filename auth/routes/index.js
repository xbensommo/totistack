/**
 * Auth module routes
 * @type {Array<import('vue-router').RouteRecordRaw>}
 */

// This keeps the "lazy" magic but lets you change folder structure per project
const lazy = (view, dir) => {
    return dir 
        ? import(`../pages/${dir}/${view}.vue`) 
        : import(`../pages/${view}.vue`)
}
export const authRoutes = () => ({
    path: '/auth',
    component: () => lazy('AuthLayout'),
    meta: {
      guestOnly: true,
      requiresAuth: false,
      title: 'Sign In',
      description: 'Sign in to your account'
    },
    children: [
      {
        path: '',
        name: 'auth.login',
        component: () => lazy('login'),
        
      },
      
  {
    path: 'register',
    name: 'auth.register',
    component: () => lazy('register'),
    meta: {
      guest: true,
      title: 'Create Account',
      description: 'Create a new account'
    }
  },
  {
    path: 'forgot-password',
    name: 'auth.forgot-password',
    component: () => lazy('forgot-password'),
    meta: {
      guest: true,
      title: 'Forgot Password',
      description: 'Reset your password'
    }
  },
  {
    path: 'reset-password',
    name: 'auth.reset-password',
    component: () => lazy('reset-password'),
    meta: {
      guest: true,
      title: 'Reset Password',
      description: 'Set a new password'
    }
  },
  /*   {
      path: 'profile',
      name: 'auth.profile',
      component: () => lazy('profile'),
      meta: {
        requiresAuth: true,
        title: 'My Profile',
        description: 'Manage your profile settings'
      }
    } */
  ]
})
