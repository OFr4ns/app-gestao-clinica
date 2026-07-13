import { v4 as uuid } from 'uuid';
import {
  countPatients,
  findPatientById,
  insertPatient,
  listPatients,
  softDeletePatient,
  updatePatient
} from '../repositories/patientRepository.js';
import {
  decryptPatient,
  normalizePatientStatus,
  patientMatchesSearch,
  patientWritableFields,
  toPatientInsertRow
} from '../mappers/patientMapper.js';
import { decryptAppointment } from '../mappers/appointmentMapper.js';
import { decryptClinicalHistory } from '../mappers/clinicalHistoryMapper.js';
import { decryptFinancialRecord } from '../mappers/financialMapper.js';
import { listAppointmentsByPatient } from '../repositories/appointmentRepository.js';
import { listClinicalHistory } from '../repositories/clinicalHistoryRepository.js';
import { listFinancialRecordsByPatient } from '../repositories/financialRepository.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, paginateItems } from '../utils/pagination.js';

function requirePsychologist(psychologistId) {
  if (!psychologistId) {
    throw new AppError('Only psychologist users can access patients', 403, 'FORBIDDEN');
  }
}

function buildRecordNumber(total) {
  return `N. ${1001 + total}`;
}

function mergePatient(existing, incoming) {
  const merged = {};

  for (const field of patientWritableFields) {
    merged[field] = Object.prototype.hasOwnProperty.call(incoming, field)
      ? incoming[field]
      : existing[field];
  }

  merged.status = Object.prototype.hasOwnProperty.call(incoming, 'status')
    ? incoming.status
    : existing.status;

  return merged;
}

function validatePatient(patient) {
  if (!patient.name || !String(patient.name).trim()) {
    throw new AppError('Patient name is required', 400, 'VALIDATION_ERROR');
  }

  const status = normalizePatientStatus(patient.status);
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    throw new AppError('Invalid patient status', 400, 'INVALID_STATUS');
  }
}

export async function getPatients({ psychologistId, status = 'ACTIVE', search = '', pagination }) {
  requirePsychologist(psychologistId);

  const normalizedStatus = status === 'ALL' ? 'ALL' : normalizePatientStatus(status);
  const rows = await listPatients({ psychologistId, status: normalizedStatus });
  const filtered = rows
    .map(decryptPatient)
    .filter((patient) => patientMatchesSearch(patient, search));

  if (!pagination) {
    return filtered;
  }

  return {
    items: paginateItems(filtered, pagination),
    pagination: buildPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: filtered.length
    })
  };
}

export async function getPatient({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const row = await findPatientById({ id, psychologistId });

  if (!row) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  return decryptPatient(row);
}

export async function createPatient({ psychologistId, data }) {
  requirePsychologist(psychologistId);

  const total = await countPatients({ psychologistId });
  const patient = {
    ...data,
    recordNumber: data.recordNumber || buildRecordNumber(total),
    status: normalizePatientStatus(data.status)
  };

  validatePatient(patient);

  const id = uuid();
  await insertPatient({
    id,
    psychologistId,
    row: toPatientInsertRow(patient)
  });

  return getPatient({ id, psychologistId });
}

export async function editPatient({ id, psychologistId, data }) {
  requirePsychologist(psychologistId);

  const current = await getPatient({ id, psychologistId });
  const merged = mergePatient(current, data);
  merged.status = normalizePatientStatus(merged.status);

  validatePatient(merged);

  const updated = await updatePatient({
    id,
    psychologistId,
    row: toPatientInsertRow(merged)
  });

  if (!updated) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  return getPatient({ id, psychologistId });
}

export async function removePatient({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const deleted = await softDeletePatient({ id, psychologistId });

  if (!deleted) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }
}

export async function exportPatientData({ id, psychologistId }) {
  const patient = await getPatient({ id, psychologistId });
  const [appointmentRows, financialRows, historyRows] = await Promise.all([
    listAppointmentsByPatient({ psychologistId, patientId: id }),
    listFinancialRecordsByPatient({ psychologistId, patientId: id }),
    listClinicalHistory({ psychologistId, patientId: id })
  ]);

  return {
    exportedAt: new Date().toISOString(),
    patient,
    appointments: appointmentRows.map((row) => decryptAppointment(row)),
    financials: financialRows.map((row) => decryptFinancialRecord(row)),
    clinicalHistory: historyRows.map((row) => decryptClinicalHistory(row))
  };
}
