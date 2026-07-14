import { v4 as uuid } from 'uuid';
import { toAppointmentRow } from '../mappers/appointmentMapper.js';
import { toClinicalHistoryRow } from '../mappers/clinicalHistoryMapper.js';
import { toFinancialRow } from '../mappers/financialMapper.js';
import { mapImportBatch } from '../mappers/importBatchMapper.js';
import { toPatientInsertRow } from '../mappers/patientMapper.js';
import { insertAppointment } from '../repositories/appointmentRepository.js';
import { insertClinicalHistory } from '../repositories/clinicalHistoryRepository.js';
import { insertFinancialRecord } from '../repositories/financialRepository.js';
import {
  completeImportBatch,
  createImportBatch,
  failImportBatch,
  findImportBatchById
} from '../repositories/importBatchRepository.js';
import { insertPatient } from '../repositories/patientRepository.js';
import { encryptField } from '../security/cryptoService.js';
import { AppError } from '../utils/AppError.js';
import {
  FIELD_LIMITS,
  digitsOnly,
  limitText,
  permissiveCpf,
  permissiveEmail,
  permissiveMoney,
  permissivePhone
} from '../validation/fieldValidation.js';

function requirePsychologist(psychologistId) {
  if (!psychologistId) {
    throw new AppError('Apenas usuários psicólogos podem importar dados', 403, 'FORBIDDEN');
  }
}

function unwrapBackup(payload) {
  const source = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

  if (
    source?.sensus_patients
    || source?.sensus_appointments
    || source?.sensus_financials
    || source?.sensus_history
  ) {
    return {
      patients: parseLegacyStorageValue(source.sensus_patients),
      appointments: parseLegacyStorageValue(source.sensus_appointments),
      financials: parseLegacyStorageValue(source.sensus_financials),
      history: parseLegacyStorageValue(source.sensus_history)
    };
  }

  return source;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseLegacyStorageValue(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]');
      return ensureArray(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function normalizeTime(value) {
  return value ? String(value).slice(0, 5) : '09:00';
}

function importSourceFilename(payload) {
  return limitText(payload?.sourceFilename || payload?.filename || '', FIELD_LIMITS.sourceFilename) || null;
}

function mapOldPatient(oldPatient) {
  return {
    recordNumber: limitText(oldPatient.recordNumber, FIELD_LIMITS.recordNumber),
    name: limitText(oldPatient.name || 'Paciente importado', FIELD_LIMITS.name) || 'Paciente importado',
    dob: oldPatient.dob,
    cpf: permissiveCpf(oldPatient.cpf),
    rg: digitsOnly(oldPatient.rg).slice(0, FIELD_LIMITS.rg),
    phone: permissivePhone(oldPatient.phone),
    whatsapp: permissivePhone(oldPatient.whatsapp),
    email: permissiveEmail(oldPatient.email),
    profession: limitText(oldPatient.profession, FIELD_LIMITS.profession),
    civilStatus: limitText(oldPatient.civilStatus, FIELD_LIMITS.civilStatus),
    address: limitText(oldPatient.address, FIELD_LIMITS.address),
    city: limitText(oldPatient.city, FIELD_LIMITS.city),
    state: limitText(oldPatient.state, FIELD_LIMITS.state),
    insurance: limitText(oldPatient.insurance, FIELD_LIMITS.insurance),
    status: oldPatient.status || 'Ativo',
    notes: limitText(oldPatient.notes, FIELD_LIMITS.notes),
    emergencyName: limitText(oldPatient.emergencyName, FIELD_LIMITS.emergencyName),
    emergencyRelationship: limitText(oldPatient.emergencyRelationship, FIELD_LIMITS.emergencyRelationship),
    emergencyPhone: permissivePhone(oldPatient.emergencyPhone)
  };
}

function mapOldAppointment(oldAppointment, patientId) {
  return {
    patientId,
    date: normalizeDate(oldAppointment.date),
    time: normalizeTime(oldAppointment.time),
    status: oldAppointment.status || 'Agendado',
    notes: limitText(oldAppointment.notes, FIELD_LIMITS.appointmentNotes)
  };
}

function mapOldFinancial(oldFinancial, patientId, appointmentId) {
  return {
    patientId,
    appointmentId,
    amount: permissiveMoney(oldFinancial.value ?? oldFinancial.amount ?? 0),
    method: oldFinancial.method || 'Dinheiro',
    dueDate: normalizeDate(oldFinancial.dueDate),
    paymentDate: oldFinancial.paymentDate ? normalizeDate(oldFinancial.paymentDate) : null,
    status: oldFinancial.status || 'Pendente',
    description: limitText(oldFinancial.description || 'Registro importado', FIELD_LIMITS.financialDescription),
    notes: limitText(oldFinancial.notes, FIELD_LIMITS.financialNotes)
  };
}

function mapOldHistory(oldHistory, patientId) {
  return {
    patientId,
    serviceDate: normalizeDate(oldHistory.date || oldHistory.serviceDate),
    title: limitText(oldHistory.title || 'Evolução importada', FIELD_LIMITS.clinicalTitle),
    notes: limitText(oldHistory.notes || 'Sem anotações.', FIELD_LIMITS.clinicalNotes)
  };
}

export async function importHtmlBackup({ psychologistId, userId, payload }) {
  requirePsychologist(psychologistId);

  const backup = unwrapBackup(payload);

  if (!backup || !Array.isArray(backup.patients) || !Array.isArray(backup.appointments)) {
    throw new AppError('Formato de backup inválido', 400, 'INVALID_BACKUP');
  }

  const batchId = uuid();
  const sourceFilename = importSourceFilename(payload);
  await createImportBatch({ id: batchId, psychologistId, userId, sourceFilename });

  const patientIdMap = new Map();
  const appointmentIdMap = new Map();
  const counts = {
    patients: 0,
    appointments: 0,
    financials: 0,
    history: 0
  };

  try {
    for (const oldPatient of ensureArray(backup.patients)) {
      const newId = uuid();
      await insertPatient({
        id: newId,
        psychologistId,
        row: toPatientInsertRow(mapOldPatient(oldPatient))
      });
      patientIdMap.set(oldPatient.id, newId);
      counts.patients += 1;
    }

    for (const oldAppointment of ensureArray(backup.appointments)) {
      const patientId = patientIdMap.get(oldAppointment.patientId);
      if (!patientId) {
        continue;
      }

      const newId = uuid();
      await insertAppointment({
        id: newId,
        psychologistId,
        row: toAppointmentRow(mapOldAppointment(oldAppointment, patientId))
      });
      appointmentIdMap.set(oldAppointment.id, newId);
      counts.appointments += 1;
    }

    for (const oldFinancial of ensureArray(backup.financials)) {
      const patientId = patientIdMap.get(oldFinancial.patientId);
      if (!patientId) {
        continue;
      }

      const appointmentId = oldFinancial.appointmentId
        ? appointmentIdMap.get(oldFinancial.appointmentId) || null
        : null;

      await insertFinancialRecord({
        id: uuid(),
        psychologistId,
        row: toFinancialRow(mapOldFinancial(oldFinancial, patientId, appointmentId))
      });
      counts.financials += 1;
    }

    for (const oldHistory of ensureArray(backup.history)) {
      const patientId = patientIdMap.get(oldHistory.patientId);
      if (!patientId) {
        continue;
      }

      await insertClinicalHistory({
        id: uuid(),
        psychologistId,
        row: toClinicalHistoryRow(mapOldHistory(oldHistory, patientId))
      });
      counts.history += 1;
    }

    await completeImportBatch({ id: batchId, counts });
  } catch (err) {
    await failImportBatch({
      id: batchId,
      errorMessageEncrypted: encryptField(err.message || 'Falha na importação')
    });
    throw err;
  }

  const batch = await findImportBatchById({ id: batchId, psychologistId });
  return mapImportBatch(batch);
}

export async function getImportBatch({ id, psychologistId }) {
  requirePsychologist(psychologistId);

  const batch = await findImportBatchById({ id, psychologistId });

  if (!batch) {
    throw new AppError('Importação não encontrada', 404, 'IMPORT_BATCH_NOT_FOUND');
  }

  return mapImportBatch(batch);
}
