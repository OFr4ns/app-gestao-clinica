import crypto from 'crypto';
import { env } from '../config/env.js';

export const CSRF_COOKIE_NAME = 'gc_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function createCsrfToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function csrfCookieOptions(maxAgeMs = 8 * 60 * 60 * 1000) {
  return {
    httpOnly: false,
    signed: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
    maxAge: maxAgeMs
  };
}

export function timingSafeEqualString(a, b) {
  if (!a || !b) {
    return false;
  }

  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
