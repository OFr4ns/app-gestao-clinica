import { v4 as uuid } from 'uuid';
import { insertAuditLog } from '../repositories/auditRepository.js';
import { encryptField } from '../security/cryptoService.js';

function requestMeta(req) {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    userAgent: req.headers['user-agent'] || null
  };
}

export async function auditEvent(req, {
  action,
  entityType,
  entityId,
  metadata
}) {
  const auth = req.auth || {};
  const meta = requestMeta(req);

  await insertAuditLog({
    id: uuid(),
    psychologistId: auth.psychologistId || null,
    userId: auth.id || null,
    action,
    entityType,
    entityId,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    metadataEncrypted: metadata ? encryptField(JSON.stringify(metadata)) : null
  });
}

export async function auditAuthEvent(req, {
  userId,
  psychologistId,
  action,
  metadata
}) {
  const meta = requestMeta(req);

  await insertAuditLog({
    id: uuid(),
    psychologistId: psychologistId || null,
    userId: userId || null,
    action,
    entityType: 'auth',
    entityId: userId || null,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    metadataEncrypted: metadata ? encryptField(JSON.stringify(metadata)) : null
  });
}

