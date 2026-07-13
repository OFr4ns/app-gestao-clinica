import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  changeFinancialStatus,
  createFinancialRecord,
  editFinancialRecord,
  getFinancialRecord,
  getFinancialRecords,
  getFinancialSummary,
  removeFinancialRecord,
  toggleFinancialPaid
} from '../services/financialService.js';
import { auditEvent } from '../services/auditService.js';
import { parsePagination } from '../utils/pagination.js';

export const financialRoutes = Router();

financialRoutes.use(authenticate);

financialRoutes.get('/financials', async (req, res, next) => {
  try {
    const financials = await getFinancialRecords({
      psychologistId: req.auth.psychologistId,
      status: req.query.status || 'ALL',
      pagination: parsePagination(req.query)
    });

    res.json({
      items: financials.items,
      financials: financials.items,
      pagination: financials.pagination
    });
  } catch (err) {
    next(err);
  }
});

financialRoutes.get('/financials/summary', async (req, res, next) => {
  try {
    const summary = await getFinancialSummary({
      psychologistId: req.auth.psychologistId
    });

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

financialRoutes.post('/financials', async (req, res, next) => {
  try {
    const financial = await createFinancialRecord({
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'FINANCIAL_CREATED',
      entityType: 'financial_record',
      entityId: financial.id,
      metadata: { status: financial.status, method: financial.method }
    });

    res.status(201).json({ financial });
  } catch (err) {
    next(err);
  }
});

financialRoutes.get('/financials/:id', async (req, res, next) => {
  try {
    const financial = await getFinancialRecord({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });

    res.json({ financial });
  } catch (err) {
    next(err);
  }
});

financialRoutes.put('/financials/:id', async (req, res, next) => {
  try {
    const financial = await editFinancialRecord({
      id: req.params.id,
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'FINANCIAL_UPDATED',
      entityType: 'financial_record',
      entityId: financial.id
    });

    res.json({ financial });
  } catch (err) {
    next(err);
  }
});

financialRoutes.patch('/financials/:id/status', async (req, res, next) => {
  try {
    const financial = await changeFinancialStatus({
      id: req.params.id,
      psychologistId: req.auth.psychologistId,
      status: req.body.status
    });
    await auditEvent(req, {
      action: 'FINANCIAL_STATUS_CHANGED',
      entityType: 'financial_record',
      entityId: financial.id,
      metadata: { status: financial.status }
    });

    res.json({ financial });
  } catch (err) {
    next(err);
  }
});

financialRoutes.post('/financials/:id/toggle-paid', async (req, res, next) => {
  try {
    const financial = await toggleFinancialPaid({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'FINANCIAL_STATUS_CHANGED',
      entityType: 'financial_record',
      entityId: financial.id,
      metadata: { status: financial.status }
    });

    res.json({ financial });
  } catch (err) {
    next(err);
  }
});

financialRoutes.delete('/financials/:id', async (req, res, next) => {
  try {
    await removeFinancialRecord({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'FINANCIAL_DELETED',
      entityType: 'financial_record',
      entityId: req.params.id
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
