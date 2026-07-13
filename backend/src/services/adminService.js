import { v4 as uuid } from 'uuid';
import { listAuditLogs, getAuditStats } from '../repositories/auditRepository.js';
import { revokeSessionsByUserId } from '../repositories/sessionRepository.js';
import {
  countActiveAdmins,
  createUser,
  findUserByEmail,
  findUserById,
  getUserStats,
  listUsers,
  softDeleteUser,
  updateUser,
  updateUserStatus
} from '../repositories/userRepository.js';
import { decryptField } from '../security/cryptoService.js';
import { hashPassword } from '../security/passwordService.js';
import { AppError } from '../utils/AppError.js';
import { toIsoDateTime } from '../utils/dateUtils.js';
import { buildPagination, paginateItems } from '../utils/pagination.js';

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    lastLoginAt: toIsoDateTime(row.last_login_at),
    createdAt: toIsoDateTime(row.created_at)
  };
}

function mapAuditLog(row) {
  let metadata = null;

  if (row.metadata_encrypted) {
    try {
      metadata = JSON.parse(decryptField(row.metadata_encrypted));
    } catch {
      metadata = null;
    }
  }

  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    metadata,
    createdAt: toIsoDateTime(row.created_at)
  };
}

export async function getAdminSummary() {
  const [users, audit] = await Promise.all([
    getUserStats(),
    getAuditStats()
  ]);

  return { users, audit };
}

export async function getAdminUsers(filters, pagination) {
  const rows = await listUsers({
    ...filters,
    limit: pagination ? 'ALL' : filters.limit
  });
  const users = rows.map(mapUser);

  if (!pagination) {
    return users;
  }

  return {
    items: paginateItems(users, pagination),
    pagination: buildPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: users.length
    })
  };
}

export async function getAdminAuditLogs(filters, pagination) {
  const rows = await listAuditLogs({
    ...filters,
    limit: pagination ? 'ALL' : filters.limit
  });
  const logs = rows.map(mapAuditLog);

  if (!pagination) {
    return logs;
  }

  return {
    items: paginateItems(logs, pagination),
    pagination: buildPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: logs.length
    })
  };
}

function normalizeRole(role) {
  return role === 'ADMIN' ? 'ADMIN' : 'PSYCHOLOGIST';
}

function normalizeStatus(status) {
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    throw new AppError('Status invalido', 400, 'VALIDATION_ERROR');
  }

  return status;
}

function validateUserPayload({ name, email, password }, { passwordRequired }) {
  if (!name || !email || (passwordRequired && !password)) {
    throw new AppError('Name, email and password are required', 400, 'VALIDATION_ERROR');
  }

  if (password && password.length < 8) {
    throw new AppError('Password must have at least 8 characters', 400, 'WEAK_PASSWORD');
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase()
  };
}

async function ensureEmailAvailable(email, currentUserId = '') {
  const existing = await findUserByEmail(email);

  if (existing && existing.id !== currentUserId) {
    throw new AppError('Email already registered', 409, 'EMAIL_ALREADY_REGISTERED');
  }
}

async function ensureCanRemoveAdmin(user) {
  if (user.role !== 'ADMIN') {
    return;
  }

  const remainingAdmins = await countActiveAdmins({ excludeUserId: user.id });
  if (remainingAdmins < 1) {
    throw new AppError('Nao e permitido remover o ultimo administrador ativo', 409, 'LAST_ADMIN');
  }
}

export async function createAdminUserAccount(payload) {
  const { name, email } = validateUserPayload(payload, { passwordRequired: true });
  await ensureEmailAvailable(email);

  const user = await createUser({
    id: uuid(),
    name,
    email,
    role: normalizeRole(payload.role),
    passwordHash: await hashPassword(payload.password)
  });

  return mapUser(user);
}

export async function createAdminPsychologist(payload) {
  return createAdminUserAccount({ ...payload, role: 'PSYCHOLOGIST' });
}

export async function updateAdminUserAccount({ id, adminUserId, payload }) {
  const current = await findUserById(id);

  if (!current) {
    throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
  }

  const { name, email } = validateUserPayload(payload, { passwordRequired: false });
  const nextRole = normalizeRole(payload.role || current.role);
  await ensureEmailAvailable(email, id);

  if (current.id === adminUserId && current.role === 'ADMIN' && nextRole !== 'ADMIN') {
    throw new AppError('Nao e permitido remover seu proprio perfil de administrador', 409, 'SELF_ADMIN_ROLE_CHANGE');
  }

  if (current.role === 'ADMIN' && nextRole !== 'ADMIN') {
    await ensureCanRemoveAdmin(current);
  }

  const user = await updateUser({
    id,
    name,
    email,
    role: nextRole,
    passwordHash: payload.password ? await hashPassword(payload.password) : null
  });

  if (payload.password) {
    await revokeSessionsByUserId(id);
  }

  return mapUser(user);
}

export async function setAdminUserStatus({ id, adminUserId, status }) {
  const current = await findUserById(id);

  if (!current) {
    throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
  }

  const nextStatus = normalizeStatus(status);

  if (current.id === adminUserId && nextStatus === 'INACTIVE') {
    throw new AppError('Nao e permitido desativar o proprio usuario administrador', 409, 'SELF_DEACTIVATION');
  }

  if (current.role === 'ADMIN' && nextStatus === 'INACTIVE') {
    await ensureCanRemoveAdmin(current);
  }

  const user = await updateUserStatus({ id, status: nextStatus });

  if (nextStatus === 'INACTIVE') {
    await revokeSessionsByUserId(id);
  }

  return mapUser(user);
}

export async function deleteAdminUserAccount({ id, adminUserId, confirmEmail }) {
  const current = await findUserById(id);

  if (!current) {
    throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
  }

  if (current.id === adminUserId) {
    throw new AppError('Nao e permitido excluir o proprio usuario administrador', 409, 'SELF_DELETE');
  }

  if (String(confirmEmail || '').trim().toLowerCase() !== current.email) {
    throw new AppError('Confirmacao de e-mail invalida', 400, 'INVALID_DELETE_CONFIRMATION');
  }

  await ensureCanRemoveAdmin(current);
  await softDeleteUser(id);
  await revokeSessionsByUserId(id);

  return mapUser({ ...current, status: 'INACTIVE' });
}
