import { pool } from '../db/pool.js';

export async function createSession({ id, userId, tokenHash, expiresAt }) {
  await pool.execute(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
    [id, userId, tokenHash, expiresAt]
  );
}

export async function findActiveSessionByTokenHash(tokenHash) {
  const [rows] = await pool.execute(
    `SELECT
       s.id AS session_id,
       s.user_id,
       s.expires_at,
       u.id,
       u.name,
       u.email,
       u.role,
       u.status
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?
       AND s.revoked_at IS NULL
       AND s.expires_at > CURRENT_TIMESTAMP(3)
       AND u.deleted_at IS NULL
       AND u.status = 'ACTIVE'
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0] || null;
}

export async function touchSession(sessionId) {
  await pool.execute(
    `UPDATE sessions
     SET last_used_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?
       AND revoked_at IS NULL`,
    [sessionId]
  );
}

export async function revokeSessionByTokenHash(tokenHash) {
  await pool.execute(
    `UPDATE sessions
     SET revoked_at = CURRENT_TIMESTAMP(3)
     WHERE token_hash = ?
       AND revoked_at IS NULL`,
    [tokenHash]
  );
}

export async function revokeSessionsByUserId(userId) {
  await pool.execute(
    `UPDATE sessions
     SET revoked_at = CURRENT_TIMESTAMP(3)
     WHERE user_id = ?
       AND revoked_at IS NULL`,
    [userId]
  );
}
