import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  createClinicalHistoryEntry,
  editClinicalHistoryEntry,
  getClinicalHistoryEntry,
  getClinicalHistoryList,
  removeClinicalHistoryEntry
} from '../services/clinicalHistoryService.js';
import { auditEvent } from '../services/auditService.js';
import { parsePagination } from '../utils/pagination.js';

export const clinicalHistoryRoutes = Router();

clinicalHistoryRoutes.use(authenticate);

clinicalHistoryRoutes.get('/clinical-history', async (req, res, next) => {
  try {
    const history = await getClinicalHistoryList({
      psychologistId: req.auth.psychologistId,
      patientId: req.query.patientId || '',
      pagination: parsePagination(req.query)
    });
    if (req.query.patientId) {
      await auditEvent(req, {
        action: 'CLINICAL_HISTORY_ACCESSED',
        entityType: 'patient',
        entityId: req.query.patientId,
        metadata: { entries: history.pagination.total, page: history.pagination.page }
      });
    }

    res.json({
      items: history.items,
      history: history.items,
      pagination: history.pagination
    });
  } catch (err) {
    next(err);
  }
});

clinicalHistoryRoutes.post('/clinical-history', async (req, res, next) => {
  try {
    const entry = await createClinicalHistoryEntry({
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'CLINICAL_HISTORY_CREATED',
      entityType: 'clinical_history',
      entityId: entry.id
    });

    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
});

clinicalHistoryRoutes.get('/clinical-history/:id', async (req, res, next) => {
  try {
    const entry = await getClinicalHistoryEntry({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'CLINICAL_HISTORY_ACCESSED',
      entityType: 'clinical_history',
      entityId: entry.id,
      metadata: { patientId: entry.patientId }
    });

    res.json({ entry });
  } catch (err) {
    next(err);
  }
});

clinicalHistoryRoutes.put('/clinical-history/:id', async (req, res, next) => {
  try {
    const entry = await editClinicalHistoryEntry({
      id: req.params.id,
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'CLINICAL_HISTORY_UPDATED',
      entityType: 'clinical_history',
      entityId: entry.id
    });

    res.json({ entry });
  } catch (err) {
    next(err);
  }
});

clinicalHistoryRoutes.delete('/clinical-history/:id', async (req, res, next) => {
  try {
    await removeClinicalHistoryEntry({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'CLINICAL_HISTORY_DELETED',
      entityType: 'clinical_history',
      entityId: req.params.id
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
