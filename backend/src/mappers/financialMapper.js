import { decryptField, encryptField } from '../security/cryptoService.js';
import { normalizeText } from '../security/hashService.js';
import { toIsoDate, toIsoDateTime } from '../utils/dateUtils.js';

export function normalizePaymentMethod(method) {
  if (!method) {
    return 'CASH';
  }

  const normalized = normalizeText(method).toUpperCase();
  const methodMap = {
    DINHEIRO: 'CASH',
    CASH: 'CASH',
    PIX: 'PIX',
    CARTAO: 'CARD',
    CARTÃO: 'CARD',
    CARD: 'CARD',
    CONVENIO: 'INSURANCE',
    CONVÊNIO: 'INSURANCE',
    INSURANCE: 'INSURANCE'
  };

  return methodMap[normalized] || normalized;
}

export function normalizeFinancialStatus(status) {
  if (!status) {
    return 'PENDING';
  }

  const normalized = normalizeText(status).toUpperCase();
  const statusMap = {
    PENDENTE: 'PENDING',
    PENDING: 'PENDING',
    PAGO: 'PAID',
    PAID: 'PAID',
    ATRASADO: 'OVERDUE',
    OVERDUE: 'OVERDUE'
  };

  return statusMap[normalized] || normalized;
}

export function toFinancialRow(data) {
  const status = normalizeFinancialStatus(data.status);
  const dueDate = data.dueDate;

  return {
    patient_id: data.patientId,
    appointment_id: data.appointmentId || null,
    amount: Number(data.amount),
    method: normalizePaymentMethod(data.method),
    due_date: dueDate,
    payment_date: status === 'PAID' ? (data.paymentDate || dueDate) : null,
    status,
    description_encrypted: encryptField(data.description),
    notes_encrypted: encryptField(data.notes)
  };
}

export function decryptFinancialRecord(row, patient = null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    patient,
    amount: Number(row.amount),
    method: row.method,
    dueDate: toIsoDate(row.due_date),
    paymentDate: toIsoDate(row.payment_date),
    status: row.status,
    description: decryptField(row.description_encrypted),
    notes: decryptField(row.notes_encrypted),
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
    deletedAt: toIsoDateTime(row.deleted_at)
  };
}

export function financialRowFromAppointment({ appointment, amount, method }) {
  const paid = appointment.status === 'ATTENDED';

  return {
    patient_id: appointment.patientId,
    appointment_id: appointment.id,
    amount: Number(amount ?? 150),
    method: normalizePaymentMethod(method),
    due_date: appointment.date,
    payment_date: paid ? appointment.date : null,
    status: paid ? 'PAID' : 'PENDING',
    description_encrypted: encryptField('Sessao terapeutica'),
    notes_encrypted: null
  };
}
