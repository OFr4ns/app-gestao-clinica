import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { loginRateLimit } from '../middlewares/loginRateLimit.js';
import { login, logout } from '../services/authService.js';
import { auditAuthEvent } from '../services/auditService.js';
import { createCsrfToken, CSRF_COOKIE_NAME, csrfCookieOptions } from '../security/csrf.js';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../security/sessionCookies.js';

export const authRoutes = Router();

authRoutes.get('/auth/csrf', (req, res) => {
  const token = createCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, csrfCookieOptions());
  res.json({ csrfToken: token });
});

authRoutes.post('/auth/register', async (req, res, next) => {
  res.status(403).json({
    error: 'PUBLIC_REGISTRATION_DISABLED',
    message: 'Cadastro público desabilitado. Solicite a criação do acesso ao administrador.'
  });
});

authRoutes.post('/auth/login', loginRateLimit, async (req, res, next) => {
  try {
    const result = await login(req.body);

    res.cookie(
      SESSION_COOKIE_NAME,
      result.token,
      sessionCookieOptions(result.maxAgeMs)
    );

    await auditAuthEvent(req, {
      userId: result.user.id,
      psychologistId: result.user.psychologistId,
      action: 'LOGIN_SUCCESS',
      metadata: { role: result.user.role }
    });

    res.json({ user: result.user });
  } catch (err) {
    await auditAuthEvent(req, {
      action: 'LOGIN_FAILED',
      metadata: { emailAttempted: req.body?.email ? String(req.body.email).trim().toLowerCase() : null }
    });
    next(err);
  }
});

authRoutes.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.auth });
});

authRoutes.post('/auth/logout', authenticate, async (req, res, next) => {
  try {
    const token = req.signedCookies?.[SESSION_COOKIE_NAME];
    if (req.auth) {
      await auditAuthEvent(req, {
        userId: req.auth.id,
        psychologistId: req.auth.psychologistId,
        action: 'LOGOUT'
      });
    }
    await logout(token);
    res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions(0));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
