import { pool } from '../db/pool.js';

export async function insertAuditLog({
  id,
  psychologistId,
  userId,
  action,
  entityType,
  entityId,
  ipAddress,
  userAgent,
  metadataEncrypted
}) {
  await pool.execute(
    `INSERT INTO audit_logs (
       id,
       psychologist_id,
       user_id,
       action,
       entity_type,
       entity_id,
       ip_address,
       user_agent,
       metadata_encrypted
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      psychologistId || null,
      userId || null,
      action,
      entityType || null,
      entityId || null,
      ipAddress || null,
      userAgent || null,
      metadataEncrypted || null
    ]
  );
}

export async function listAuditLogs({ userId, psychologistId, action, limit = 100 }) {
  const params = [];
  const clauses = ['1 = 1'];
  const shouldLimit = limit !== 'ALL';
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 500);

  if (userId) {
    clauses.push('user_id = ?');
    params.push(userId);
  }

  if (psychologistId) {
    clauses.push('psychologist_id = ?');
    params.push(psychologistId);
  }

  if (action) {
    clauses.push('action = ?');
    params.push(action);
  }

  const [rows] = await pool.execute(
    `SELECT
       id,
       psychologist_id,
       user_id,
       action,
       entity_type,
       entity_id,
       ip_address,
       user_agent,
       metadata_encrypted,
       created_at
     FROM audit_logs
     WHERE ${clauses.join(' AND ')}
     ORDER BY created_at DESC
     ${shouldLimit ? `LIMIT ${safeLimit}` : ''}`,
    params
  );

  return rows;
}

export async function getAuditStats() {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*) AS total_events,
       SUM(CASE WHEN action = 'LOGIN_FAILED' THEN 1 ELSE 0 END) AS failed_logins,
       SUM(CASE WHEN action = 'LOGIN_SUCCESS' THEN 1 ELSE 0 END) AS successful_logins
     FROM audit_logs`
  );

  return {
    totalEvents: Number(rows[0]?.total_events || 0),
    failedLogins: Number(rows[0]?.failed_logins || 0),
    successfulLogins: Number(rows[0]?.successful_logins || 0)
  };
}
