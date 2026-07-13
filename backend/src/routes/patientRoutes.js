import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  createPatient,
  editPatient,
  exportPatientData,
  getPatient,
  getPatients,
  removePatient
} from '../services/patientService.js';
import { auditEvent } from '../services/auditService.js';
import { parsePagination } from '../utils/pagination.js';

export const patientRoutes = Router();

patientRoutes.use(authenticate);

patientRoutes.get('/patients', async (req, res, next) => {
  try {
    const patients = await getPatients({
      psychologistId: req.auth.psychologistId,
      status: req.query.status || 'ACTIVE',
      search: req.query.search || '',
      pagination: parsePagination(req.query)
    });

    res.json({
      items: patients.items,
      patients: patients.items,
      pagination: patients.pagination
    });
  } catch (err) {
    next(err);
  }
});

patientRoutes.get('/patients/:id/export', async (req, res, next) => {
  try {
    const exported = await exportPatientData({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'PATIENT_DATA_EXPORTED',
      entityType: 'patient',
      entityId: req.params.id,
      metadata: {
        appointments: exported.appointments.length,
        financials: exported.financials.length,
        clinicalHistory: exported.clinicalHistory.length
      }
    });

    res.setHeader('Content-Disposition', `attachment; filename="paciente-${req.params.id}.json"`);
    res.json({ export: exported });
  } catch (err) {
    next(err);
  }
});

patientRoutes.post('/patients', async (req, res, next) => {
  try {
    const patient = await createPatient({
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'PATIENT_CREATED',
      entityType: 'patient',
      entityId: patient.id
    });

    res.status(201).json({ patient });
  } catch (err) {
    next(err);
  }
});

patientRoutes.get('/patients/:id', async (req, res, next) => {
  try {
    const patient = await getPatient({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });

    res.json({ patient });
  } catch (err) {
    next(err);
  }
});

patientRoutes.put('/patients/:id', async (req, res, next) => {
  try {
    const patient = await editPatient({
      id: req.params.id,
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'PATIENT_UPDATED',
      entityType: 'patient',
      entityId: patient.id
    });

    res.json({ patient });
  } catch (err) {
    next(err);
  }
});

patientRoutes.delete('/patients/:id', async (req, res, next) => {
  try {
    await removePatient({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'PATIENT_DELETED',
      entityType: 'patient',
      entityId: req.params.id
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
