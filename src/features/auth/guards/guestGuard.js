/**
 * @file src/features/auth/guards/guestGuard.js
 */

import authService from '../services/authService.js';

export function createGuestGuard(options = {}) {
  const redirect = options.redirect || '/';

  return async () => {
    await authService.waitForInitialAuthState();
    const user = authService.getCurrentUser();
    if (!user) return true;
    return { path: redirect };
  };
}

export default createGuestGuard;
