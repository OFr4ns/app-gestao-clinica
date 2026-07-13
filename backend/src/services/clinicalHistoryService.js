import { v4 as uuid } from 'uuid';
import {
  decryptClinicalHistory,
  toClinicalHistoryRow
} from '../mappers/clinicalHistoryMapper.js';
import { decryptPatient } from '../mappers/patientMapper.js';
import {
  findClinicalHistoryById,
  insertClinicalHistory,
  listClinicalHistory,
  softDeleteClinicalHistory,
  updateClinicalHistory
} from '../repositories/clinicalHistoryRepository.js';
import { findPatientById } from '../repositories/patientRepository.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, paginateItems } from '../utils/pagination.js';
import {
  FIELD_LIMITS,
  assertMaxLength,
  assertRequiredMaxLength,
  normalizeDateField
} from '../validation/fieldValidation.js';

function requirePsychologist(psychologistId) {
  if (!psychologistId) {
    throw new AppError('Only psychologist users can access clinical history', 403, 'FORBIDDEN');
  }
}

function validateClinicalHistory(data) {
  if (!data.patientId) {
    throw new AppError('Patient is required', 400, 'VALIDATION_ERROR');
  }

  data.serviceDate = normalizeDateField(data.serviceDate || data.date, 'Data do atendimento');
  data.title = assertRequiredMaxLength(data.title, FIELD_LIMITS.clinicalTitle, 'Titulo');
  data.notes = assertRequiredMaxLength(data.notes, FIELD_LIMITS.clinicalNotes, 'Anotacoes');

  if (!(data.serviceDate || data.date)) {
    throw new AppError('Service date is required', 400, 'VALIDATION_ERROR');
  }
}

async function getScopedPatient({ patientId, psychologistId }) {
  const row = await findPatientById({ id: patientId, psychologistId });

  if (!row) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  return decryptPatient(row);
}

async function hydrateHistory(row, psychologistId) {
  const patientRow = await findPatientById({ id: row.patient_id, psychologistId });
  const patient = patientRow ? decryptPatient(patientRow) : null;
  return decryptClinicalHistory(row, patient);
}

export async function getClinicalHistoryList({ psychologistId, patientId, pagination }) {
  requirePsychologist(psychologistId);

  if (patientId) {
    await getScopedPatient({ patientId, psychologistId });
  }

  const rows = await listClinicalHistory({ psychologistId, patientId });
  const history = [];

  for (const row of rows) {
    history.push(await hydrateHistory(row, psychologistId));
  }

  if (!pagination) {
    return history;
  }

  return {
    items: paginateItems(history, pagination),
    pagination: buildPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: history.length
    })
  };
}

export async function getClinicalHistoryEntry({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const row = await findClinicalHistoryById({ id, psychologistId });

  if (!row) {
    throw new AppError('Clinical history entry not found', 404, 'CLINICAL_HISTORY_NOT_FOUND');
  }

  return hydrateHistory(row, psychologistId);
}

export async function createClinicalHistoryEntry({ psychologistId, data }) {
  requirePsychologist(psychologistId);
  validateClinicalHistory(data);
  await getScopedPatient({ patientId: data.patientId, psychologistId });

  const id = uuid();
  await insertClinicalHistory({
    id,
    psychologistId,
    row: toClinicalHistoryRow(data)
  });

  return getClinicalHistoryEntry({ id, psychologistId });
}

export async function editClinicalHistoryEntry({ id, psychologistId, data }) {
  requirePsychologist(psychologistId);

  const current = await getClinicalHistoryEntry({ id, psychologistId });
  const merged = {
    patientId: Object.prototype.hasOwnProperty.call(data, 'patientId') ? data.patientId : current.patientId,
    serviceDate: Object.prototype.hasOwnProperty.call(data, 'serviceDate') ? data.serviceDate : current.serviceDate,
    title: Object.prototype.hasOwnProperty.call(data, 'title') ? data.title : current.title,
    notes: Object.prototype.hasOwnProperty.call(data, 'notes') ? data.notes : current.notes
  };

  validateClinicalHistory(merged);
  await getScopedPatient({ patientId: merged.patientId, psychologistId });

  const updated = await updateClinicalHistory({
    id,
    psychologistId,
    row: toClinicalHistoryRow(merged)
  });

  if (!updated) {
    throw new AppError('Clinical history entry not found', 404, 'CLINICAL_HISTORY_NOT_FOUND');
  }

  return getClinicalHistoryEntry({ id, psychologistId });
}

export async function removeClinicalHistoryEntry({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const deleted = await softDeleteClinicalHistory({ id, psychologistId });

  if (!deleted) {
    throw new AppError('Clinical history entry not found', 404, 'CLINICAL_HISTORY_NOT_FOUND');
  }
}
