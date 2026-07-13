import { decryptField, encryptField } from '../security/cryptoService.js';
import { toIsoDate, toIsoDateTime } from '../utils/dateUtils.js';

export function toClinicalHistoryRow(data) {
  return {
    patient_id: data.patientId,
    service_date: data.serviceDate || data.date,
    title_encrypted: encryptField(data.title),
    notes_encrypted: encryptField(data.notes)
  };
}

export function decryptClinicalHistory(row, patient = null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    patientId: row.patient_id,
    patient,
    serviceDate: toIsoDate(row.service_date),
    title: decryptField(row.title_encrypted),
    notes: decryptField(row.notes_encrypted),
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
    deletedAt: toIsoDateTime(row.deleted_at)
  };
}

