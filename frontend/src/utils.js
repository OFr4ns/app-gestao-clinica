export const today = () => new Date().toISOString().slice(0, 10);

export const fieldLimits = {
  name: 160,
  email: 255,
  password: 128,
  recordNumber: 60,
  cpf: 11,
  rg: 9,
  phone: 11,
  profession: 120,
  civilStatus: 60,
  address: 255,
  city: 120,
  state: 60,
  insurance: 120,
  notes: 5000,
  emergencyName: 160,
  emergencyRelationship: 80,
  appointmentNotes: 2000,
  financialDescription: 160,
  financialNotes: 2000,
  clinicalTitle: 160,
  clinicalNotes: 10000
};

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function limitDigits(value, maxLength) {
  return digitsOnly(value).slice(0, maxLength);
}

export function money(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

export function statusLabel(status) {
  const labels = {
    PSYCHOLOGIST: 'Psicólogo',
    ADMIN: 'Admin',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    ATTENDED: 'Presença',
    MISSED: 'Falta',
    RESCHEDULED: 'Reagendado',
    REMOVED: 'Removido',
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Atrasado',
    CASH: 'Dinheiro',
    PIX: 'Pix',
    CARD: 'Cartão',
    TRANSFER: 'Transferência',
    INSURANCE: 'Convênio'
  };

  return labels[status] || status || '-';
}

export function pick(source, fields, fallback) {
  const result = { ...fallback };
  for (const field of fields) {
    result[field] = source?.[field] ?? fallback[field] ?? '';
  }
  return result;
}
