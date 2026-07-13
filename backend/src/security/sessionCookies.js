import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'gc_session';

export function sessionCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
    maxAge: maxAgeMs
  };
}

