import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

function getEncryptionKey() {
  const configured = env.security.encryptionKey;

  if (!configured) {
    throw new Error('APP_ENCRYPTION_KEY is required');
  }

  const key = Buffer.from(configured, 'base64');

  if (key.length === 32) {
    return key;
  }

  if (env.nodeEnv === 'development') {
    return crypto.createHash('sha256').update(configured).digest();
  }

  throw new Error('APP_ENCRYPTION_KEY must be a 32-byte base64 value');
}

export function encryptField(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(value), 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext.toString('base64')
  ].join(':');
}

export function isEncryptedField(payload) {
  if (!payload) {
    return false;
  }

  const [version, ivBase64, authTagBase64, ciphertextBase64] = String(payload).split(':');
  return Boolean(version === VERSION && ivBase64 && authTagBase64 && ciphertextBase64);
}

export function decryptField(payload) {
  if (!payload) {
    return null;
  }

  const [version, ivBase64, authTagBase64, ciphertextBase64] = payload.split(':');

  if (version !== VERSION || !ivBase64 || !authTagBase64 || !ciphertextBase64) {
    throw new Error('Unsupported encrypted field format');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivBase64, 'base64')
  );

  decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, 'base64')),
    decipher.final()
  ]);

  return plaintext.toString('utf8');
}
