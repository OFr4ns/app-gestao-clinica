import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  changeAppointmentStatus,
  createAppointment,
  editAppointment,
  getAppointment,
  getAppointments,
  markAppointmentPresence,
  removeAppointment
} from '../services/appointmentService.js';
import { auditEvent } from '../services/auditService.js';
import { parsePagination } from '../utils/pagination.js';

export const appointmentRoutes = Router();

appointmentRoutes.use(authenticate);

appointmentRoutes.get('/appointments', async (req, res, next) => {
  try {
    const appointments = await getAppointments({
      psychologistId: req.auth.psychologistId,
      date: req.query.date || '',
      pagination: parsePagination(req.query)
    });

    res.json({
      items: appointments.items,
      appointments: appointments.items,
      pagination: appointments.pagination
    });
  } catch (err) {
    next(err);
  }
});

appointmentRoutes.post('/appointments', async (req, res, next) => {
  try {
    const appointment = await createAppointment({
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'APPOINTMENT_CREATED',
      entityType: 'appointment',
      entityId: appointment.id,
      metadata: { status: appointment.status }
    });

    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentRoutes.get('/appointments/:id', async (req, res, next) => {
  try {
    const appointment = await getAppointment({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentRoutes.put('/appointments/:id', async (req, res, next) => {
  try {
    const appointment = await editAppointment({
      id: req.params.id,
      psychologistId: req.auth.psychologistId,
      data: req.body
    });
    await auditEvent(req, {
      action: 'APPOINTMENT_UPDATED',
      entityType: 'appointment',
      entityId: appointment.id,
      metadata: { status: appointment.status }
    });

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentRoutes.patch('/appointments/:id/status', async (req, res, next) => {
  try {
    const appointment = await changeAppointmentStatus({
      id: req.params.id,
      psychologistId: req.auth.psychologistId,
      status: req.body.status
    });
    await auditEvent(req, {
      action: 'APPOINTMENT_STATUS_CHANGED',
      entityType: 'appointment',
      entityId: appointment.id,
      metadata: { status: appointment.status }
    });

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentRoutes.post('/appointments/:id/presence', async (req, res, next) => {
  try {
    const appointment = await markAppointmentPresence({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'APPOINTMENT_PRESENCE_MARKED',
      entityType: 'appointment',
      entityId: appointment.id
    });

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentRoutes.delete('/appointments/:id', async (req, res, next) => {
  try {
    const appointment = await removeAppointment({
      id: req.params.id,
      psychologistId: req.auth.psychologistId
    });
    await auditEvent(req, {
      action: 'APPOINTMENT_REMOVED',
      entityType: 'appointment',
      entityId: appointment.id
    });

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});
