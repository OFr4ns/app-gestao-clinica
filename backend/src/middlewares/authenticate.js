import { authenticateToken } from '../services/authService.js';
import { SESSION_COOKIE_NAME } from '../security/sessionCookies.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.signedCookies?.[SESSION_COOKIE_NAME];
    const auth = await authenticateToken(token);

    if (!auth) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication required'
      });
    }

    req.auth = auth.user;
    req.sessionId = auth.sessionId;
    return next();
  } catch (err) {
    return next(err);
  }
}

