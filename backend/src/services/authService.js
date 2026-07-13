import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
  createPsychologistUser,
  findUserByEmail,
  updateLastLogin
} from '../repositories/userRepository.js';
import {
  createSession,
  findActiveSessionByTokenHash,
  revokeSessionByTokenHash,
  touchSession
} from '../repositories/sessionRepository.js';
import { hashPassword, verifyPassword } from '../security/passwordService.js';
import { sha256 } from '../security/hashService.js';

function publicUser(user) {
  return {
    id: user.id || user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    psychologistId: user.role === 'PSYCHOLOGIST' ? (user.id || user.user_id) : null
  };
}

function sessionTtlMs() {
  return env.security.sessionTtlHours * 60 * 60 * 1000;
}

function expiresAtDate() {
  return new Date(Date.now() + sessionTtlMs());
}

function toMySqlDateTime(date) {
  return date.toISOString().slice(0, 23).replace('T', ' ');
}

export async function registerPsychologist({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400, 'VALIDATION_ERROR');
  }

  if (password.length < 8) {
    throw new AppError('Password must have at least 8 characters', 400, 'WEAK_PASSWORD');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_ALREADY_REGISTERED');
  }

  const user = await createPsychologistUser({
    id: uuid(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password)
  });

  return publicUser(user);
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  }

  const user = await findUserByEmail(email.trim().toLowerCase());

  if (!user || user.status !== 'ACTIVE') {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const validPassword = await verifyPassword(password, user.password_hash);

  if (!validPassword) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = expiresAtDate();

  await createSession({
    id: uuid(),
    userId: user.id,
    tokenHash: sha256(token),
    expiresAt: toMySqlDateTime(expiresAt)
  });
  await updateLastLogin(user.id);

  return {
    token,
    maxAgeMs: sessionTtlMs(),
    user: publicUser(user)
  };
}

export async function authenticateToken(token) {
  if (!token) {
    return null;
  }

  const session = await findActiveSessionByTokenHash(sha256(token));

  if (!session || session.status !== 'ACTIVE') {
    return null;
  }

  await touchSession(session.session_id);

  return {
    sessionId: session.session_id,
    user: publicUser(session)
  };
}

export async function logout(token) {
  if (!token) {
    return;
  }

  await revokeSessionByTokenHash(sha256(token));
}
