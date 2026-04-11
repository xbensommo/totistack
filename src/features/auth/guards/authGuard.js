/**
 * @file src/features/auth/guards/authGuard.js
 */

import authService from '../services/authService.js';

export function createAuthGuard(options = {}) {
  const redirect = options.redirect || '/login';

  return async (to) => {
    await authService.waitForInitialAuthState();
    const user = authService.getCurrentUser();
    if (user) return true;
    return {
      path: redirect,
      query: { redirect: to.fullPath },
    };
  };
}

export default createAuthGuard;
