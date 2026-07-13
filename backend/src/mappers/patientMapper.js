import { decryptField, encryptField } from '../security/cryptoService.js';
import { hmacDigits, hmacSearch, normalizeText } from '../security/hashService.js';
import { toIsoDate, toIsoDateTime } from '../utils/dateUtils.js';

const encryptedFields = {
  recordNumber: 'record_number_encrypted',
  name: 'name_encrypted',
  dob: 'dob_encrypted',
  cpf: 'cpf_encrypted',
  rg: 'rg_encrypted',
  phone: 'phone_encrypted',
  whatsapp: 'whatsapp_encrypted',
  email: 'email_encrypted',
  profession: 'profession_encrypted',
  civilStatus: 'civil_status_encrypted',
  address: 'address_encrypted',
  city: 'city_encrypted',
  state: 'state_encrypted',
  insurance: 'insurance_encrypted',
  notes: 'notes_encrypted',
  emergencyName: 'emergency_name_encrypted',
  emergencyRelationship: 'emergency_relationship_encrypted',
  emergencyPhone: 'emergency_phone_encrypted'
};

export const patientWritableFields = Object.keys(encryptedFields);

export function normalizePatientStatus(status) {
  if (!status) {
    return 'ACTIVE';
  }

  const normalized = String(status).trim().toUpperCase();

  if (['ACTIVE', 'ATIVO'].includes(normalized)) {
    return 'ACTIVE';
  }

  if (['INACTIVE', 'INATIVO'].includes(normalized)) {
    return 'INACTIVE';
  }

  return normalized;
}

export function toPatientInsertRow(patient) {
  const row = {};

  for (const [apiField, column] of Object.entries(encryptedFields)) {
    row[column] = encryptField(patient[apiField]);
  }

  row.record_number_hash = hmacSearch(patient.recordNumber);
  row.cpf_hash = hmacDigits(patient.cpf);
  row.rg_hash = hmacSearch(patient.rg);
  row.phone_hash = hmacDigits(patient.phone);
  row.whatsapp_hash = hmacDigits(patient.whatsapp);
  row.email_hash = hmacSearch(patient.email);
  row.status = normalizePatientStatus(patient.status);

  return row;
}

export function decryptPatient(row) {
  if (!row) {
    return null;
  }

  const patient = {
    id: row.id,
    psychologistId: row.psychologist_id,
    status: row.status,
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
    deletedAt: toIsoDateTime(row.deleted_at)
  };

  for (const [apiField, column] of Object.entries(encryptedFields)) {
    patient[apiField] = decryptField(row[column]);
  }

  patient.dob = toIsoDate(patient.dob);

  return patient;
}

export function patientMatchesSearch(patient, search) {
  if (!search) {
    return true;
  }

  const term = normalizeText(search);

  if (!term) {
    return true;
  }

  const haystack = [
    patient.name,
    patient.recordNumber,
    patient.cpf,
    patient.phone,
    patient.whatsapp,
    patient.email
  ]
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .map(normalizeText)
    .join(' ');

  return haystack.includes(term);
}
