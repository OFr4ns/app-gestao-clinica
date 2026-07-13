import { v4 as uuid } from 'uuid';
import {
  decryptAppointment,
  normalizeAppointmentStatus,
  toAppointmentRow
} from '../mappers/appointmentMapper.js';
import { financialRowFromAppointment } from '../mappers/financialMapper.js';
import { decryptPatient } from '../mappers/patientMapper.js';
import {
  findAppointmentById,
  insertAppointment,
  listAppointments,
  softDeleteAppointment,
  updateAppointment,
  updateAppointmentStatus
} from '../repositories/appointmentRepository.js';
import { insertFinancialRecord, markFinancialRecordPaidByAppointment } from '../repositories/financialRepository.js';
import { findPatientById } from '../repositories/patientRepository.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, paginateItems } from '../utils/pagination.js';

const allowedStatuses = ['SCHEDULED', 'CONFIRMED', 'ATTENDED', 'MISSED', 'RESCHEDULED', 'REMOVED'];

function requirePsychologist(psychologistId) {
  if (!psychologistId) {
    throw new AppError('Only psychologist users can access appointments', 403, 'FORBIDDEN');
  }
}

function validateAppointment(data) {
  if (!data.patientId) {
    throw new AppError('Patient is required', 400, 'VALIDATION_ERROR');
  }

  if (!data.date) {
    throw new AppError('Appointment date is required', 400, 'VALIDATION_ERROR');
  }

  if (!data.time) {
    throw new AppError('Appointment time is required', 400, 'VALIDATION_ERROR');
  }

  const status = normalizeAppointmentStatus(data.status);
  if (!allowedStatuses.includes(status)) {
    throw new AppError('Invalid appointment status', 400, 'INVALID_STATUS');
  }

  if (data.generateFinancial !== false && data.amount !== undefined && Number(data.amount) < 0) {
    throw new AppError('Financial amount cannot be negative', 400, 'INVALID_AMOUNT');
  }
}

async function getActivePatient({ patientId, psychologistId }) {
  const row = await findPatientById({ id: patientId, psychologistId });

  if (!row) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  const patient = decryptPatient(row);

  if (patient.status !== 'ACTIVE') {
    throw new AppError('Only active patients can be scheduled', 400, 'PATIENT_INACTIVE');
  }

  return patient;
}

export async function getAppointments({ psychologistId, date, pagination }) {
  requirePsychologist(psychologistId);

  const rows = await listAppointments({ psychologistId, date });
  const appointments = [];

  for (const row of rows) {
    const patientRow = await findPatientById({ id: row.patient_id, psychologistId });
    const patient = patientRow ? decryptPatient(patientRow) : null;
    appointments.push(decryptAppointment(row, patient));
  }

  if (!pagination) {
    return appointments;
  }

  return {
    items: paginateItems(appointments, pagination),
    pagination: buildPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: appointments.length
    })
  };
}

export async function getAppointment({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const row = await findAppointmentById({ id, psychologistId });

  if (!row) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  const patientRow = await findPatientById({ id: row.patient_id, psychologistId });
  return decryptAppointment(row, patientRow ? decryptPatient(patientRow) : null);
}

export async function createAppointment({ psychologistId, data }) {
  requirePsychologist(psychologistId);
  validateAppointment(data);

  await getActivePatient({ patientId: data.patientId, psychologistId });

  const id = uuid();
  const row = toAppointmentRow({
    ...data,
    status: normalizeAppointmentStatus(data.status)
  });

  await insertAppointment({ id, psychologistId, row });

  const appointment = await getAppointment({ id, psychologistId });

  if (data.generateFinancial !== false) {
    await insertFinancialRecord({
      id: uuid(),
      psychologistId,
      row: financialRowFromAppointment({
        appointment,
        amount: data.amount,
        method: data.method
      })
    });
  }

  return getAppointment({ id, psychologistId });
}

export async function editAppointment({ id, psychologistId, data }) {
  requirePsychologist(psychologistId);
  const current = await getAppointment({ id, psychologistId });

  const merged = {
    patientId: Object.prototype.hasOwnProperty.call(data, 'patientId') ? data.patientId : current.patientId,
    date: Object.prototype.hasOwnProperty.call(data, 'date') ? data.date : current.date,
    time: Object.prototype.hasOwnProperty.call(data, 'time') ? data.time : current.time,
    status: Object.prototype.hasOwnProperty.call(data, 'status') ? data.status : current.status,
    notes: Object.prototype.hasOwnProperty.call(data, 'notes') ? data.notes : current.notes
  };

  validateAppointment(merged);
  await getActivePatient({ patientId: merged.patientId, psychologistId });

  const updated = await updateAppointment({
    id,
    psychologistId,
    row: toAppointmentRow({
      ...merged,
      status: normalizeAppointmentStatus(merged.status)
    })
  });

  if (!updated) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  return getAppointment({ id, psychologistId });
}

export async function changeAppointmentStatus({ id, psychologistId, status }) {
  requirePsychologist(psychologistId);

  const normalizedStatus = normalizeAppointmentStatus(status);

  if (!allowedStatuses.includes(normalizedStatus)) {
    throw new AppError('Invalid appointment status', 400, 'INVALID_STATUS');
  }

  const updated = await updateAppointmentStatus({ id, psychologistId, status: normalizedStatus });

  if (!updated) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  if (normalizedStatus === 'ATTENDED') {
    const appointment = await getAppointment({ id, psychologistId });
    await markFinancialRecordPaidByAppointment({
      appointmentId: id,
      psychologistId,
      paymentDate: appointment.date
    });
  }

  return getAppointment({ id, psychologistId });
}

export async function markAppointmentPresence({ id, psychologistId }) {
  return changeAppointmentStatus({
    id,
    psychologistId,
    status: 'ATTENDED'
  });
}

export async function removeAppointment({ id, psychologistId }) {
  requirePsychologist(psychologistId);
  const current = await getAppointment({ id, psychologistId });

  const deleted = await softDeleteAppointment({ id, psychologistId });

  if (!deleted) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  return { ...current, status: 'REMOVED' };
}
