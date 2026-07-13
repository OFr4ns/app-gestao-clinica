import { decryptField, encryptField } from '../security/cryptoService.js';
import { normalizeText } from '../security/hashService.js';
import { toIsoDate, toIsoDateTime } from '../utils/dateUtils.js';

export function normalizeAppointmentStatus(status) {
  if (!status) {
    return 'SCHEDULED';
  }

  const normalized = normalizeText(status).toUpperCase();
  const statusMap = {
    AGENDADO: 'SCHEDULED',
    SCHEDULED: 'SCHEDULED',
    CONFIRMADO: 'CONFIRMED',
    CONFIRMED: 'CONFIRMED',
    PRESENCA: 'ATTENDED',
    PRESENÇA: 'ATTENDED',
    ATTENDED: 'ATTENDED',
    FALTA: 'MISSED',
    MISSED: 'MISSED',
    REAGENDADO: 'RESCHEDULED',
    RESCHEDULED: 'RESCHEDULED',
    REMOVIDO: 'REMOVED',
    REMOVED: 'REMOVED'
  };

  return statusMap[normalized] || normalized;
}

export function toAppointmentRow(data) {
  return {
    patient_id: data.patientId,
    appointment_date: data.date,
    appointment_time: data.time,
    status: normalizeAppointmentStatus(data.status),
    notes_encrypted: encryptField(data.notes)
  };
}

export function decryptAppointment(row, patient = null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    patientId: row.patient_id,
    patient,
    date: toIsoDate(row.appointment_date),
    time: String(row.appointment_time).slice(0, 5),
    status: row.status,
    notes: decryptField(row.notes_encrypted),
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
    deletedAt: toIsoDateTime(row.deleted_at)
  };
}
