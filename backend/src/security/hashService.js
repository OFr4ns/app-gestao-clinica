import crypto from 'crypto';
import { env } from '../config/env.js';

function getHashKey() {
  if (!env.security.hashKey) {
    throw new Error('APP_HASH_KEY é obrigatória');
  }

  return env.security.hashKey;
}

export function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export function hmacSearch(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  return crypto
    .createHmac('sha256', getHashKey())
    .update(normalized)
    .digest('hex');
}

export function hmacDigits(value) {
  const normalized = normalizeDigits(value);

  if (!normalized) {
    return null;
  }

  return crypto
    .createHmac('sha256', getHashKey())
    .update(normalized)
    .digest('hex');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
