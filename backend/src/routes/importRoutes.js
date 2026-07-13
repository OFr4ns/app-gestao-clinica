import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getImportBatch, importHtmlBackup } from '../services/importService.js';
import { auditEvent } from '../services/auditService.js';

export const importRoutes = Router();

importRoutes.use(authenticate);

importRoutes.post('/imports/html-json', async (req, res, next) => {
  try {
    const batch = await importHtmlBackup({
      psychologistId: req.auth.psychologistId,
      userId: req.auth.id,
      payload: req.body
    });
    await auditEvent(req, {
      action: 'IMPORT_COMPLETED',
      entityType: 'import_batch',
      entityId: batch.id,
      metadata: { counts: batch.counts }
    });

    res.status(201).json({ importBatch: batch });
  } catch (err) {
    next(err);
  }
});

importRoutes.get('/imports/:id', async (req, res, next) => {
  try {
    const batch = await getImportBatch({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });

    res.json({ importBatch: batch });
  } catch (err) {
    next(err);
  }
});
