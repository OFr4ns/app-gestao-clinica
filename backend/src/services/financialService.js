import { v4 as uuid } from 'uuid';
import {
  decryptFinancialRecord,
  normalizeFinancialStatus,
  normalizePaymentMethod,
  toFinancialRow
} from '../mappers/financialMapper.js';
import { decryptPatient } from '../mappers/patientMapper.js';
import {
  findFinancialRecordById,
  getFinancialTotals,
  insertFinancialRecord,
  listFinancialRecords,
  softDeleteFinancialRecord,
  updateFinancialRecord,
  updateFinancialRecordStatus
} from '../repositories/financialRepository.js';
import { findPatientById } from '../repositories/patientRepository.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, paginateItems } from '../utils/pagination.js';
import {
  FIELD_LIMITS,
  assertMaxLength,
  normalizeDateField,
  normalizeMoney
} from '../validation/fieldValidation.js';

const allowedStatuses = ['PENDING', 'PAID', 'OVERDUE'];
const allowedMethods = ['CASH', 'PIX', 'CARD', 'TRANSFER', 'INSURANCE'];

function requirePsychologist(psychologistId) {
  if (!psychologistId) {
    throw new AppError('Apenas usuários psicólogos podem acessar registros financeiros', 403, 'FORBIDDEN');
  }
}

function validateFinancialRecord(data) {
  if (!data.patientId) {
    throw new AppError('Paciente é obrigatório', 400, 'VALIDATION_ERROR');
  }

  data.amount = normalizeMoney(data.amount);
  data.dueDate = normalizeDateField(data.dueDate, 'Vencimento');
  data.paymentDate = data.paymentDate ? normalizeDateField(data.paymentDate, 'Data de pagamento') : null;
  data.description = assertMaxLength(data.description, FIELD_LIMITS.financialDescription, 'Descrição');
  data.notes = assertMaxLength(data.notes, FIELD_LIMITS.financialNotes, 'Observações');

  if (!data.dueDate) {
    throw new AppError('Data de vencimento é obrigatória', 400, 'VALIDATION_ERROR');
  }

  const method = normalizePaymentMethod(data.method);
  if (!allowedMethods.includes(method)) {
    throw new AppError('Forma de pagamento inválida', 400, 'INVALID_PAYMENT_METHOD');
  }

  const status = normalizeFinancialStatus(data.status);
  if (!allowedStatuses.includes(status)) {
    throw new AppError('Status financeiro inválido', 400, 'INVALID_STATUS');
  }
}

async function getScopedPatient({ patientId, psychologistId }) {
  const patientRow = await findPatientById({ id: patientId, psychologistId });

  if (!patientRow) {
    throw new AppError('Paciente não encontrado', 404, 'PATIENT_NOT_FOUND');
  }

  return decryptPatient(patientRow);
}

async function hydrateFinancialRecord(row, psychologistId) {
  const patientRow = await findPatientById({ id: row.patient_id, psychologistId });
  const patient = patientRow ? decryptPatient(patientRow) : null;
  return decryptFinancialRecord(row, patient);
}

export async function getFinancialRecords({ psychologistId, status = 'ALL', pagination }) {
  requirePsychologist(psychologistId);

  const normalizedStatus = status === 'ALL' ? 'ALL' : normalizeFinancialStatus(status);
  if (normalizedStatus !== 'ALL' && !allowedStatuses.includes(normalizedStatus)) {
    throw new AppError('Status financeiro inválido', 400, 'INVALID_STATUS');
  }

  const rows = await listFinancialRecords({ psychologistId, status: normalizedStatus });
  const records = [];

  for (const row of rows) {
    records.push(await hydrateFinancialRecord(row, psychologistId));
  }

  if (!pagination) {
    return records;
  }

  return {
    items: paginateItems(records, pagination),
    pagination: buildPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: records.length
    })
  };
}

export async function getFinancialSummary({ psychologistId }) {
  requirePsychologist(psychologistId);
  return getFinancialTotals({ psychologistId });
}

export async function getFinancialRecord({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const row = await findFinancialRecordById({ id, psychologistId });
  if (!row) {
    throw new AppError('Registro financeiro não encontrado', 404, 'FINANCIAL_RECORD_NOT_FOUND');
  }

  return hydrateFinancialRecord(row, psychologistId);
}

export async function createFinancialRecord({ psychologistId, data }) {
  requirePsychologist(psychologistId);
  validateFinancialRecord(data);
  await getScopedPatient({ patientId: data.patientId, psychologistId });

  const id = uuid();
  await insertFinancialRecord({
    id,
    psychologistId,
    row: toFinancialRow(data)
  });

  return getFinancialRecord({ id, psychologistId });
}

export async function editFinancialRecord({ id, psychologistId, data }) {
  requirePsychologist(psychologistId);
  const current = await getFinancialRecord({ id, psychologistId });

  const merged = {
    patientId: Object.prototype.hasOwnProperty.call(data, 'patientId') ? data.patientId : current.patientId,
    appointmentId: current.appointmentId,
    amount: Object.prototype.hasOwnProperty.call(data, 'amount') ? data.amount : current.amount,
    method: Object.prototype.hasOwnProperty.call(data, 'method') ? data.method : current.method,
    dueDate: Object.prototype.hasOwnProperty.call(data, 'dueDate') ? data.dueDate : current.dueDate,
    paymentDate: Object.prototype.hasOwnProperty.call(data, 'paymentDate') ? data.paymentDate : current.paymentDate,
    status: Object.prototype.hasOwnProperty.call(data, 'status') ? data.status : current.status,
    description: Object.prototype.hasOwnProperty.call(data, 'description') ? data.description : current.description,
    notes: Object.prototype.hasOwnProperty.call(data, 'notes') ? data.notes : current.notes
  };

  validateFinancialRecord(merged);
  await getScopedPatient({ patientId: merged.patientId, psychologistId });

  const updated = await updateFinancialRecord({
    id,
    psychologistId,
    row: toFinancialRow(merged)
  });

  if (!updated) {
    throw new AppError('Registro financeiro não encontrado', 404, 'FINANCIAL_RECORD_NOT_FOUND');
  }

  return getFinancialRecord({ id, psychologistId });
}

export async function changeFinancialStatus({ id, psychologistId, status }) {
  requirePsychologist(psychologistId);

  const current = await getFinancialRecord({ id, psychologistId });
  const normalizedStatus = normalizeFinancialStatus(status);

  if (!allowedStatuses.includes(normalizedStatus)) {
    throw new AppError('Status financeiro inválido', 400, 'INVALID_STATUS');
  }

  const paymentDate = normalizedStatus === 'PAID'
    ? (current.paymentDate || new Date().toISOString().slice(0, 10))
    : null;

  const updated = await updateFinancialRecordStatus({
    id,
    psychologistId,
    status: normalizedStatus,
    paymentDate
  });

  if (!updated) {
    throw new AppError('Registro financeiro não encontrado', 404, 'FINANCIAL_RECORD_NOT_FOUND');
  }

  return getFinancialRecord({ id, psychologistId });
}

export async function toggleFinancialPaid({ id, psychologistId }) {
  const current = await getFinancialRecord({ id, psychologistId });
  return changeFinancialStatus({
    id,
    psychologistId,
    status: current.status === 'PAID' ? 'PENDING' : 'PAID'
  });
}

export async function removeFinancialRecord({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const deleted = await softDeleteFinancialRecord({ id, psychologistId });
  if (!deleted) {
    throw new AppError('Registro financeiro não encontrado', 404, 'FINANCIAL_RECORD_NOT_FOUND');
  }
}
