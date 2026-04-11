/**
 * @file src/features/auth/utils/auth.errors.js
 */

export class AuthFeatureError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AuthFeatureError';
    this.code = options.code || 'AUTH_FEATURE_ERROR';
    this.cause = options.cause;
    this.meta = options.meta || null;
  }
}

export function normalizeAuthError(error) {
  const errorMap = {
    'auth/invalid-email': 'INVALID_EMAIL',
    'auth/user-disabled': 'ACCOUNT_DISABLED',
    'auth/user-not-found': 'INVALID_CREDENTIALS',
    'auth/wrong-password': 'INVALID_CREDENTIALS',
    'auth/invalid-credential': 'INVALID_CREDENTIALS',
    'auth/email-already-in-use': 'EMAIL_ALREADY_IN_USE',
    'auth/weak-password': 'WEAK_PASSWORD',
    'auth/too-many-requests': 'TOO_MANY_ATTEMPTS',
    'auth/network-request-failed': 'NETWORK_ERROR',
    'auth/popup-closed-by-user': 'POPUP_CLOSED',
    'auth/cancelled-popup-request': 'POPUP_CANCELLED',
    'auth/operation-not-allowed': 'OPERATION_NOT_ALLOWED',
    'auth/account-exists-with-different-credential': 'ACCOUNT_EXISTS',
  };

  if (error instanceof AuthFeatureError) {
    return error;
  }

  const code = error?.code || 'AUTH_UNKNOWN';
  const message = errorMap[code] || error?.message || 'UNKNOWN_ERROR';

  return new AuthFeatureError(message, {
    code,
    cause: error,
  });
}
