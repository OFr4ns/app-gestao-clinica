const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function keyFor(req) {
  return req.ip || req.headers['x-forwarded-for'] || 'unknown';
}

export function loginRateLimit(req, res, next) {
  const key = keyFor(req);
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  entry.count += 1;
  attempts.set(key, entry);

  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Muitas tentativas de login. Tente novamente mais tarde.'
    });
  }

  return next();
}
