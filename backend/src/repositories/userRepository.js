import { pool } from '../db/pool.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password_hash, role, status, last_login_at, created_at
     FROM users
     WHERE email = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, status, last_login_at, created_at
     FROM users
     WHERE id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function createUser({ id, name, email, passwordHash, role }) {
  await pool.execute(
    `INSERT INTO users (id, name, email, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [id, name, email, passwordHash, role]
  );

  return findUserById(id);
}

export async function createPsychologistUser({ id, name, email, passwordHash }) {
  return createUser({ id, name, email, passwordHash, role: 'PSYCHOLOGIST' });
}

export async function createAdminUser({ id, name, email, passwordHash }) {
  return createUser({ id, name, email, passwordHash, role: 'ADMIN' });
}

export async function listUsers({ role = 'ALL', status = 'ALL', limit = 100 }) {
  const params = [];
  const clauses = ['deleted_at IS NULL'];
  const shouldLimit = limit !== 'ALL';
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 500);

  if (role && role !== 'ALL') {
    clauses.push('role = ?');
    params.push(role);
  }

  if (status && status !== 'ALL') {
    clauses.push('status = ?');
    params.push(status);
  }

  const [rows] = await pool.execute(
    `SELECT id, name, email, role, status, last_login_at, created_at
     FROM users
     WHERE ${clauses.join(' AND ')}
     ORDER BY created_at DESC
     ${shouldLimit ? `LIMIT ${safeLimit}` : ''}`,
    params
  );

  return rows;
}

export async function getUserStats() {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*) AS total_users,
       SUM(CASE WHEN role = 'PSYCHOLOGIST' THEN 1 ELSE 0 END) AS psychologists,
       SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) AS admins,
       SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_users
     FROM users
     WHERE deleted_at IS NULL`
  );

  return {
    totalUsers: Number(rows[0]?.total_users || 0),
    psychologists: Number(rows[0]?.psychologists || 0),
    admins: Number(rows[0]?.admins || 0),
    activeUsers: Number(rows[0]?.active_users || 0)
  };
}

export async function updateLastLogin(userId) {
  await pool.execute(
    `UPDATE users
     SET last_login_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [userId]
  );
}

export async function updateUser({ id, name, email, role, passwordHash }) {
  const updates = ['name = ?', 'email = ?', 'role = ?'];
  const params = [name, email, role];

  if (passwordHash) {
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  params.push(id);

  await pool.execute(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = ?
       AND deleted_at IS NULL`,
    params
  );

  return findUserById(id);
}

export async function updateUserStatus({ id, status }) {
  await pool.execute(
    `UPDATE users
     SET status = ?
     WHERE id = ?
       AND deleted_at IS NULL`,
    [status, id]
  );

  return findUserById(id);
}

export async function softDeleteUser(id) {
  await pool.execute(
    `UPDATE users
     SET deleted_at = CURRENT_TIMESTAMP(3),
         status = 'INACTIVE'
     WHERE id = ?
       AND deleted_at IS NULL`,
    [id]
  );
}

export async function countActiveAdmins({ excludeUserId = '' } = {}) {
  const params = [];
  const clauses = [
    "role = 'ADMIN'",
    "status = 'ACTIVE'",
    'deleted_at IS NULL'
  ];

  if (excludeUserId) {
    clauses.push('id <> ?');
    params.push(excludeUserId);
  }

  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM users
     WHERE ${clauses.join(' AND ')}`,
    params
  );

  return Number(rows[0]?.total || 0);
}
