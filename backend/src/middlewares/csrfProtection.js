import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, timingSafeEqualString } from '../security/csrf.js';

const protectedMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const exemptPaths = new Set([
  '/api/auth/login',
  '/api/auth/register'
]);

export function csrfProtection(req, res, next) {
  if (!protectedMethods.has(req.method) || exemptPaths.has(req.path)) {
    return next();
  }

  const cookieToken = req.signedCookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!timingSafeEqualString(cookieToken, headerToken)) {
    return res.status(403).json({
      error: 'INVALID_CSRF_TOKEN',
      message: 'Invalid CSRF token'
    });
  }

  return next();
}
