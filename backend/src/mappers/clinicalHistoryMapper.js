import { decryptField, encryptField, isEncryptedField } from '../security/cryptoService.js';
import { toIsoDate, toIsoDateTime } from '../utils/dateUtils.js';

function encryptRequiredClinicalField(value, label) {
  const encrypted = encryptField(value);

  if (!isEncryptedField(encrypted)) {
    throw new Error(`${label} must be encrypted before persistence`);
  }

  return encrypted;
}

export function toClinicalHistoryRow(data) {
  return {
    patient_id: data.patientId,
    service_date: data.serviceDate || data.date,
    title_encrypted: encryptRequiredClinicalField(data.title, 'Clinical history title'),
    notes_encrypted: encryptRequiredClinicalField(data.notes, 'Clinical history notes')
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
