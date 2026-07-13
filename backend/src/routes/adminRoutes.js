import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import {
  createAdminUserAccount,
  deleteAdminUserAccount,
  getAdminAuditLogs,
  getAdminSummary,
  getAdminUsers,
  setAdminUserStatus,
  updateAdminUserAccount
} from '../services/adminService.js';
import { auditEvent } from '../services/auditService.js';
import { parsePagination } from '../utils/pagination.js';

export const adminRoutes = Router();

adminRoutes.use('/admin', authenticate);
adminRoutes.use('/admin', requireAdmin);

adminRoutes.get('/admin/summary', async (req, res, next) => {
  try {
    const summary = await getAdminSummary();
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

adminRoutes.get('/admin/users', async (req, res, next) => {
  try {
    const users = await getAdminUsers({
      role: req.query.role || 'ALL',
      status: req.query.status || 'ALL',
      limit: req.query.limit || 100
    }, parsePagination(req.query));

    res.json({
      items: users.items,
      users: users.items,
      pagination: users.pagination
    });
  } catch (err) {
    next(err);
  }
});

adminRoutes.post('/admin/users', async (req, res, next) => {
  try {
    const user = await createAdminUserAccount(req.body);
    await auditEvent(req, {
      action: 'ADMIN_CREATED_USER',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role }
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

adminRoutes.put('/admin/users/:id', async (req, res, next) => {
  try {
    const user = await updateAdminUserAccount({
      id: req.params.id,
      adminUserId: req.auth.id,
      payload: req.body
    });
    await auditEvent(req, {
      action: 'ADMIN_UPDATED_USER',
      entityType: 'user',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        passwordChanged: Boolean(req.body?.password)
      }
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

adminRoutes.patch('/admin/users/:id/status', async (req, res, next) => {
  try {
    const user = await setAdminUserStatus({
      id: req.params.id,
      adminUserId: req.auth.id,
      status: req.body?.status
    });
    await auditEvent(req, {
      action: user.status === 'ACTIVE' ? 'ADMIN_ACTIVATED_USER' : 'ADMIN_DEACTIVATED_USER',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role, status: user.status }
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

adminRoutes.delete('/admin/users/:id', async (req, res, next) => {
  try {
    const user = await deleteAdminUserAccount({
      id: req.params.id,
      adminUserId: req.auth.id,
      confirmEmail: req.body?.confirmEmail
    });
    await auditEvent(req, {
      action: 'ADMIN_DELETED_USER',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role }
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

adminRoutes.get('/admin/audit-logs', async (req, res, next) => {
  try {
    const logs = await getAdminAuditLogs({
      userId: req.query.userId || '',
      psychologistId: req.query.psychologistId || '',
      action: req.query.action || '',
      limit: req.query.limit || 100
    }, parsePagination(req.query));

    res.json({
      items: logs.items,
      logs: logs.items,
      pagination: logs.pagination
    });
  } catch (err) {
    next(err);
  }
});
